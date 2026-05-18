package com.follower.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final String secret;

    public JwtService(@Value("${jwt.secret}") String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException(
                    "jwt.secret must not be empty — set the JWT_SECRET environment variable");
        }
        this.secret = secret;
    }

    /**
     * Parses and validates a raw JWT string using JwtReader.
     * Throws IllegalArgumentException / SecurityException on any failure —
     * both are RuntimeExceptions, caught in JwtAuthenticationFilter.
     */
    public JwtClaims parse(String rawToken) {
        JwtReader.JwtToken token = JwtReader.parseAndValidate(rawToken, secret,
                java.time.Instant.now().getEpochSecond());

        return new JwtClaims(
                Long.parseLong(token.claims.user_id),
                token.claims.username,
                token.claims.email,
                token.claims.role
        );
    }
}