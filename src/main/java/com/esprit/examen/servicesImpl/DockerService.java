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
import com.github.dockerjava.httpclient5.ApacheDockerHttpClient;
import com.github.dockerjava.transport.DockerHttpClient;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
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

        DockerHttpClient httpClient = new ApacheDockerHttpClient.Builder()
                .dockerHost(URI.create(dockerHost))
                .maxConnections(100)
                .connectionTimeout(Duration.ofSeconds(30))
                .responseTimeout(Duration.ofSeconds(45))
                .build();

        dockerClient = DockerClientImpl.getInstance(config, httpClient);
        log.info("Docker client initialized with host: {}", dockerHost);
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
        try {
            List<Image> images = dockerClient.listImagesCmd()
                    .withImageNameFilter(fullImage)
                    .exec();
            if (!images.isEmpty()) {
                log.info("Image {} already exists locally", fullImage);
                return;
            }
        } catch (Exception e) {
            log.debug("Could not check for existing image, will attempt pull");
        }

        log.info("Pulling image: {}", fullImage);
        try {
            dockerClient.pullImageCmd(imageName)
                    .withTag(tag)
                    .start()
                    .awaitCompletion();
            log.info("Successfully pulled image: {}", fullImage);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Image pull interrupted for: " + fullImage, e);
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

        allocatedPorts.add(hostPort);
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

    public int findAvailablePort() {
        for (int port = portRangeStart; port <= portRangeEnd; port++) {
            if (!allocatedPorts.contains(port)) {
                return port;
            }
        }
        throw new RuntimeException("No available ports in range " + portRangeStart + "-" + portRangeEnd);
    }

    public record ContainerInfo(String containerId, int assignedPort) {}
}
