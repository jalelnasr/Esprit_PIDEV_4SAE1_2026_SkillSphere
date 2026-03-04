package com.esprit.apigateway2.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/gateway")
@Tag(name = "Gateway")
public class GatewayInfoController {

    private final DiscoveryClient discoveryClient;
    private final RouteLocator routeLocator;

    public GatewayInfoController(DiscoveryClient discoveryClient, RouteLocator routeLocator) {
        this.discoveryClient = discoveryClient;
        this.routeLocator = routeLocator;
    }

    @GetMapping("/services")
    @Operation(
            summary = "List currently discovered services and configured gateway routes",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    public Mono<GatewayServicesResponse> listServices() {
        Mono<List<RouteSummary>> routesMono = routeLocator.getRoutes()
                .map(route -> new RouteSummary(
                        route.getId(),
                        route.getUri().toString(),
                        route.getPredicate().toString()
                ))
                .collectSortedList(Comparator.comparing(RouteSummary::routeId));

        Mono<List<ServiceSummary>> servicesMono = Mono.fromCallable(this::discoverServices)
                .subscribeOn(Schedulers.boundedElastic());

        return Mono.zip(servicesMono, routesMono)
                .map(tuple -> new GatewayServicesResponse(tuple.getT1(), tuple.getT2()));
    }

    private List<ServiceSummary> discoverServices() {
        return discoveryClient.getServices().stream()
                .sorted()
                .map(serviceId -> new ServiceSummary(
                        serviceId,
                        discoveryClient.getInstances(serviceId).stream()
                                .map(ServiceInstance::getUri)
                                .map(Object::toString)
                                .sorted()
                                .toList()
                ))
                .toList();
    }

    public record GatewayServicesResponse(List<ServiceSummary> discoveredServices, List<RouteSummary> gatewayRoutes) {
    }

    public record ServiceSummary(String serviceId, List<String> instanceUris) {
    }

    public record RouteSummary(String routeId, String uri, String predicate) {
    }
}
