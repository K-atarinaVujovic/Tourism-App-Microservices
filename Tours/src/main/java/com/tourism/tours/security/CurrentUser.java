package com.tourism.tours.security;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CurrentUser {
    private Long id;
    private String username;
    private String role;
}
