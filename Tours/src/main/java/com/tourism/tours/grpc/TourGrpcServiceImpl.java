package com.tourism.tours.grpc;

import com.tourism.tours.dto.CreateTourRequest;
import com.tourism.tours.dto.TourResponse;
import com.tourism.tours.enums.TourDifficulty;
import com.tourism.tours.grpc.generated.*;
import com.tourism.tours.security.AuthService;
import com.tourism.tours.security.CurrentUser;
import com.tourism.tours.service.TourService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TourGrpcServiceImpl extends TourGrpcServiceGrpc.TourGrpcServiceImplBase {

    private final TourService tourService;
    private final AuthService authService;

    @Override
    public void getMyTours(GetMyToursRequest request, StreamObserver<TourListResponse> responseObserver) {
        try {
            String authorization = resolveAuthorization(request.getAuthorization());
            CurrentUser user = authService.getCurrentUser(authorization);

            TourListResponse.Builder response = TourListResponse.newBuilder();

            tourService.getMyTours(user)
                    .forEach(tour -> response.addTours(mapToGrpcResponse(tour)));

            responseObserver.onNext(response.build());
            responseObserver.onCompleted();
        } catch (RuntimeException e) {
            responseObserver.onError(
                    Status.PERMISSION_DENIED
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void createTour(CreateTourGrpcRequest request, StreamObserver<TourGrpcResponse> responseObserver) {
        try {
            String authorization = resolveAuthorization(request.getAuthorization());
            CurrentUser user = authService.getCurrentUser(request.getAuthorization());

            CreateTourRequest createRequest = new CreateTourRequest();
            createRequest.setName(request.getName());
            createRequest.setDescription(request.getDescription());
            createRequest.setDifficulty(TourDifficulty.valueOf(request.getDifficulty()));
            createRequest.setTags(request.getTagsList());

            TourResponse created = tourService.createTour(
                    createRequest,
                    user,
                    authorization
            );

            responseObserver.onNext(mapToGrpcResponse(created));
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            responseObserver.onError(
                    Status.INVALID_ARGUMENT
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        } catch (RuntimeException e) {
            responseObserver.onError(
                    Status.PERMISSION_DENIED
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    private TourGrpcResponse mapToGrpcResponse(TourResponse tour) {
        TourGrpcResponse.Builder builder = TourGrpcResponse.newBuilder()
                .setId(tour.getId() == null ? 0 : tour.getId())
                .setAuthorId(tour.getAuthorId() == null ? 0 : tour.getAuthorId())
                .setAuthorUsername(tour.getAuthorUsername() == null ? "" : tour.getAuthorUsername())
                .setName(tour.getName() == null ? "" : tour.getName())
                .setDescription(tour.getDescription() == null ? "" : tour.getDescription())
                .setDifficulty(tour.getDifficulty() == null ? "" : tour.getDifficulty().name())
                .setStatus(tour.getStatus() == null ? "" : tour.getStatus().name())
                .setPrice(tour.getPrice());

        if (tour.getTags() != null) {
            builder.addAllTags(tour.getTags());
        }

        return builder.build();
    }

    private String resolveAuthorization(String requestAuthorization) {
        if (requestAuthorization != null && !requestAuthorization.isBlank()) {
            return requestAuthorization;
        }

        String metadataAuthorization = GrpcAuthContext.getAuthorization();

        if (metadataAuthorization == null || metadataAuthorization.isBlank()) {
            throw new RuntimeException("Missing Authorization header");
        }

        return metadataAuthorization;
    }
}