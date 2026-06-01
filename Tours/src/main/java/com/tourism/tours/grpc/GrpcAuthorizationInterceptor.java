package com.tourism.tours.grpc;

import io.grpc.Context;
import io.grpc.Contexts;
import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import org.springframework.stereotype.Component;

@Component
public class GrpcAuthorizationInterceptor implements ServerInterceptor {

    private static final Metadata.Key<String> AUTHORIZATION =
            Metadata.Key.of("authorization", Metadata.ASCII_STRING_MARSHALLER);

    private static final Metadata.Key<String> GRPC_GATEWAY_AUTHORIZATION =
            Metadata.Key.of("grpcgateway-authorization", Metadata.ASCII_STRING_MARSHALLER);

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
            ServerCall<ReqT, RespT> call,
            Metadata headers,
            ServerCallHandler<ReqT, RespT> next
    ) {
        String authorization = headers.get(AUTHORIZATION);

        if (authorization == null || authorization.isBlank()) {
            authorization = headers.get(GRPC_GATEWAY_AUTHORIZATION);
        }

        Context context = Context.current()
                .withValue(GrpcAuthContext.AUTHORIZATION, authorization);

        return Contexts.interceptCall(context, call, headers, next);
    }
}