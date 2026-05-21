package com.follower.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${services.stakeholders-url}")
    private String stakeholdersUrl;

    @Value("${services.blog-url}")
    private String blogUrl;

    @Bean("stakeholdersClient")
    public WebClient stakeholdersClient() {
        return WebClient.builder()
                .baseUrl(stakeholdersUrl)
                .filter(forwardAuthorizationHeader())
                .build();
    }

    @Bean("blogClient")
    public WebClient blogClient() {
        return WebClient.builder()
                .baseUrl(blogUrl)
                .filter(forwardAuthorizationHeader())
                .build();
    }

    /**
     * WebClient filter that reads the Authorization header from the current
     * incoming HTTP request and forwards it to the downstream service.
     * Works because Spring's RequestContextFilter exposes the request via
     * RequestContextHolder for the duration of each servlet request thread.
     */
    private ExchangeFilterFunction forwardAuthorizationHeader() {
        return ExchangeFilterFunction.ofRequestProcessor(clientRequest -> {
            ServletRequestAttributes attributes =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

            if (attributes != null) {
                String authHeader = attributes.getRequest().getHeader("Authorization");
                if (authHeader != null && !authHeader.isBlank()) {
                    ClientRequest forwarded = ClientRequest.from(clientRequest)
                            .header("Authorization", authHeader)
                            .build();
                    return reactor.core.publisher.Mono.just(forwarded);
                }
            }

            return reactor.core.publisher.Mono.just(clientRequest);
        });
    }
}