package com.follower.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final ObjectProvider<CurrentUser> currentUserProvider;

    public JwtAuthenticationFilter(JwtService jwtService,
                                   ObjectProvider<CurrentUser> currentUserProvider) {
        this.jwtService = jwtService;
        this.currentUserProvider = currentUserProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                    "Missing or malformed Authorization header");
            return;
        }

        String rawToken = authHeader.substring(7).strip();

        try {
            JwtClaims claims = jwtService.parse(rawToken);
            currentUserProvider.getObject().setClaims(claims);
        } catch (IllegalArgumentException | SecurityException ex) {
            // JwtReader throws IllegalArgumentException for bad claims/format,
            // SecurityException for invalid signature
            log.warn("JWT validation failed: {}", ex.getMessage());
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
            return;
        }

        filterChain.doFilter(request, response);
    }
}