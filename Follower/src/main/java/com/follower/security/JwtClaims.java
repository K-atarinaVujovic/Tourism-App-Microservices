package com.follower.security;

public record JwtClaims(long userId, String username, String email, String role) {}