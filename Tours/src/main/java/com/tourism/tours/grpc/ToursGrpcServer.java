package com.tourism.tours.grpc;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.SmartLifecycle;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ToursGrpcServer implements SmartLifecycle {

    private final TourGrpcServiceImpl tourGrpcService;

    @Value("${grpc.server.port:9093}")
    private int grpcPort;

    private Server server;
    private boolean running = false;

    @Override
    public void start() {
        try {
            server = ServerBuilder
                    .forPort(grpcPort)
                    .addService(tourGrpcService)
                    .build()
                    .start();

            running = true;
            System.out.println("Tours gRPC server started on port " + grpcPort);
        } catch (Exception e) {
            throw new RuntimeException("Failed to start Tours gRPC server", e);
        }
    }

    @Override
    public void stop() {
        if (server != null) {
            server.shutdown();
        }
        running = false;
    }

    @Override
    public boolean isRunning() {
        return running;
    }
}