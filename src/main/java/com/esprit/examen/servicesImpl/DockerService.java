package com.esprit.examen.servicesImpl;

import com.esprit.examen.entities.DockerTemplate;
import com.github.dockerjava.api.DockerClient;
import com.github.dockerjava.api.command.CreateContainerCmd;
import com.github.dockerjava.api.command.CreateContainerResponse;
import com.github.dockerjava.api.command.InspectContainerResponse;
import com.github.dockerjava.api.model.*;
import com.github.dockerjava.core.DefaultDockerClientConfig;
import com.github.dockerjava.core.DockerClientConfig;
import com.github.dockerjava.core.DockerClientImpl;
import com.github.dockerjava.okhttp.OkDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import com.esprit.examen.exceptions.BadRequestException;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class DockerService {

    @Value("${docker.host}")
    private String dockerHost;

    @Value("${docker.tls.verify}")
    private boolean tlsVerify;

    @Value("${gamix.container.port-range-start}")
    private int portRangeStart;

    @Value("${gamix.container.port-range-end}")
    private int portRangeEnd;

    private DockerClient dockerClient;
    private final Set<Integer> allocatedPorts = ConcurrentHashMap.newKeySet();

    @PostConstruct
    public void init() {
        DockerClientConfig config = DefaultDockerClientConfig.createDefaultConfigBuilder()
                .withDockerHost(dockerHost)
                .withDockerTlsVerify(tlsVerify)
                .build();

        DockerHttpClient httpClient = new OkDockerHttpClient.Builder()
                .dockerHost(config.getDockerHost())
                .connectTimeout((int) Duration.ofSeconds(30).toMillis())
                .readTimeout((int) Duration.ofSeconds(45).toMillis())
                .build();

        dockerClient = DockerClientImpl.getInstance(config, httpClient);
        log.info("Docker client initialized with host: {}", config.getDockerHost());

        // Scan running containers to recover allocated ports from previous sessions
        recoverAllocatedPorts();
    }

    /** Scan all running gamix containers and mark their host ports as allocated */
    private void recoverAllocatedPorts() {
        try {
            List<Container> containers = dockerClient.listContainersCmd()
                    .withStatusFilter(List.of("running", "created", "paused"))
                    .exec();
            for (Container container : containers) {
                String[] names = container.getNames();
                boolean isGamixContainer = names != null &&
                        java.util.Arrays.stream(names).anyMatch(n -> n.contains("gamix-lab"));
                if (!isGamixContainer) continue;

                ContainerPort[] ports = container.getPorts();
                if (ports == null) continue;
                for (ContainerPort port : ports) {
                    Integer publicPort = port.getPublicPort();
                    if (publicPort != null && publicPort >= portRangeStart && publicPort <= portRangeEnd) {
                        allocatedPorts.add(publicPort);
                        log.info("Recovered allocated port {} from container {}", publicPort,
                                names[0].replaceFirst("/", ""));
                    }
                }
            }
            if (!allocatedPorts.isEmpty()) {
                log.info("Recovered {} allocated port(s) from running containers", allocatedPorts.size());
            }
        } catch (Exception e) {
            log.warn("Could not scan running containers for port recovery: {}", e.getMessage());
        }
    }

    @PreDestroy
    public void cleanup() {
        if (dockerClient != null) {
            try {
                dockerClient.close();
            } catch (Exception e) {
                log.warn("Error closing Docker client: {}", e.getMessage());
            }
        }
    }

    public void pullImage(String imageName, String tag) {
        String fullImage = imageName + ":" + tag;

        // Use inspectImageCmd for a reliable local check
        try {
            dockerClient.inspectImageCmd(fullImage).exec();
            log.info("Image {} already exists locally", fullImage);
            return;
        } catch (com.github.dockerjava.api.exception.NotFoundException e) {
            log.info("Image {} not found locally, pulling...", fullImage);
        } catch (Exception e) {
            log.debug("Could not inspect image, will attempt pull: {}", e.getMessage());
        }

        try {
            dockerClient.pullImageCmd(imageName)
                    .withTag(tag)
                    .start()
                    .awaitCompletion();
            log.info("Successfully pulled image: {}", fullImage);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BadRequestException("Image pull interrupted for: " + fullImage);
        }
    }

    public ContainerInfo createAndStartContainer(DockerTemplate template, String containerName) {
        String fullImage = template.getImageName() + ":" + template.getImageVersion();
        int hostPort = findAvailablePort();

        // Parse the exposed port from template (e.g. "80" or "80/tcp")
        int containerPort = 80;
        if (template.getExposedPorts() != null && !template.getExposedPorts().isEmpty()) {
            String portStr = template.getExposedPorts().split("[/,]")[0].trim();
            containerPort = Integer.parseInt(portStr);
        }

        // Build port bindings
        ExposedPort exposedPort = ExposedPort.tcp(containerPort);
        Ports portBindings = new Ports();
        portBindings.bind(exposedPort, Ports.Binding.bindPort(hostPort));

        // Build host config
        HostConfig hostConfig = HostConfig.newHostConfig()
                .withPortBindings(portBindings);

        if (template.getMemoryLimitMb() != null) {
            hostConfig = hostConfig.withMemory((long) template.getMemoryLimitMb() * 1024 * 1024);
        }
        if (template.getCpuLimit() != null) {
            hostConfig = hostConfig.withNanoCPUs((long) (template.getCpuLimit() * 1_000_000_000));
        }

        // Create container
        CreateContainerCmd createCmd = dockerClient.createContainerCmd(fullImage)
                .withName(containerName)
                .withExposedPorts(exposedPort)
                .withHostConfig(hostConfig);

        // Add environment variables if specified
        if (template.getEnvironmentVariables() != null && !template.getEnvironmentVariables().isEmpty()) {
            List<String> envList = new ArrayList<>();
            for (String env : template.getEnvironmentVariables().split(",")) {
                envList.add(env.trim());
            }
            createCmd = createCmd.withEnv(envList);
        }

        // Add startup command if specified
        if (template.getStartupCommand() != null && !template.getStartupCommand().isEmpty()) {
            createCmd = createCmd.withCmd(template.getStartupCommand().split("\\s+"));
        }

        CreateContainerResponse container = createCmd.exec();
        String containerId = container.getId();
        log.info("Created container: {} ({})", containerName, containerId);

        // Start the container
        dockerClient.startContainerCmd(containerId).exec();
        log.info("Started container: {} on port {}", containerName, hostPort);

        return new ContainerInfo(containerId, hostPort);
    }

    public void stopContainer(String containerId) {
        try {
            dockerClient.stopContainerCmd(containerId)
                    .withTimeout(10)
                    .exec();
            log.info("Stopped container: {}", containerId);
        } catch (Exception e) {
            log.warn("Error stopping container {}: {}", containerId, e.getMessage());
        }
    }

    public void removeContainer(String containerId) {
        try {
            // Release the port
            try {
                InspectContainerResponse info = dockerClient.inspectContainerCmd(containerId).exec();
                if (info.getNetworkSettings() != null && info.getNetworkSettings().getPorts() != null) {
                    info.getNetworkSettings().getPorts().getBindings().values().forEach(bindings -> {
                        if (bindings != null) {
                            for (Ports.Binding binding : bindings) {
                                try {
                                    allocatedPorts.remove(Integer.parseInt(binding.getHostPortSpec()));
                                } catch (NumberFormatException ignored) {}
                            }
                        }
                    });
                }
            } catch (Exception ignored) {}

            dockerClient.removeContainerCmd(containerId)
                    .withForce(true)
                    .exec();
            log.info("Removed container: {}", containerId);
        } catch (Exception e) {
            log.warn("Error removing container {}: {}", containerId, e.getMessage());
        }
    }

    public String getContainerStatus(String containerId) {
        try {
            InspectContainerResponse inspection = dockerClient.inspectContainerCmd(containerId).exec();
            InspectContainerResponse.ContainerState state = inspection.getState();
            if (state == null) return "UNKNOWN";
            if (Boolean.TRUE.equals(state.getRunning())) return "RUNNING";
            if (Boolean.TRUE.equals(state.getPaused())) return "PAUSED";
            if (Boolean.TRUE.equals(state.getRestarting())) return "RESTARTING";
            if (state.getExitCodeLong() != null) return "EXITED";
            return "UNKNOWN";
        } catch (Exception e) {
            log.warn("Error inspecting container {}: {}", containerId, e.getMessage());
            return "NOT_FOUND";
        }
    }

    public boolean isContainerRunning(String containerId) {
        return "RUNNING".equals(getContainerStatus(containerId));
    }

    public synchronized int findAvailablePort() {
        for (int port = portRangeStart; port <= portRangeEnd; port++) {
            if (!allocatedPorts.contains(port)) {
                allocatedPorts.add(port);
                return port;
            }
        }
        throw new BadRequestException("No available ports in range " + portRangeStart + "-" + portRangeEnd);
    }

    public record ContainerInfo(String containerId, int assignedPort) {}
}
