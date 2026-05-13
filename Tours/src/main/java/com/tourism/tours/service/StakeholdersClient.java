package com.tourism.tours.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class StakeholdersClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${stakeholders.url:http://localhost:8082}")
    private String stakeholdersUrl;

    public String getUserRole(Long userId, String authorizationHeader) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authorizationHeader);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                stakeholdersUrl + "/profiles/" + userId,
                HttpMethod.GET,
                entity,
                Map.class
        );

        Map body = response.getBody();

        if (body == null || body.get("role") == null) {
            throw new RuntimeException("User profile role not found");
        }

        return body.get("role").toString();
    }
}