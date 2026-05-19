package com.follower.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Configuration
public class Neo4jConfig {
    
    // Konfiguracija se učitava iz application.yml
    // spring.neo4j.uri i spring.neo4j.authentication properties
}
