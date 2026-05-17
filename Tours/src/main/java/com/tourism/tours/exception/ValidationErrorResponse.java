package com.tourism.tours.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class ValidationErrorResponse {
    private String message;
    private Map<String, String> errors;
}
