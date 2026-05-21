package com.tourism.tours.security;

import jwtreader.JwtReader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Value("${jwt.secret}")
    private String jwtSecret;

    public CurrentUser getCurrentUser(String authorizationHeader){
        JwtReader.JwtToken token = JwtReader.readAndValidate(authorizationHeader, jwtSecret);
        return  new CurrentUser(
                Long.parseLong(token.claims.user_id),
                token.claims.username,
                token.claims.role
        );
    }
}
