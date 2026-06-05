package com.tourism.tours.grpc;

import io.grpc.Context;

public final class GrpcAuthContext {
    public static final Context.Key<String> AUTHORIZATION =
            Context.key("authorization");

    private GrpcAuthContext() {
    }

    public static String getAuthorization() {
        return AUTHORIZATION.get();
    }
}