package com.follower.security;

import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

/**
 * Request-scoped holder for the authenticated user's claims.
 * Populated by {@link JwtAuthenticationFilter} before the controller runs.
 */
@Component
@RequestScope
public class CurrentUser {

    private JwtClaims claims;

    public JwtClaims getClaims() {
        return claims;
    }

    public void setClaims(JwtClaims claims) {
        this.claims = claims;
    }

    public long getUserId() {
        assertAuthenticated();
        return claims.userId();
    }

    private void assertAuthenticated() {
        if (claims == null) {
            throw new IllegalStateException("No authenticated user in current request");
        }
    }
}