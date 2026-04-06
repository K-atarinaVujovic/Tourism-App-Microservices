package com.tourism.blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentRequest {

    @NotNull(message = "Author id is required")
    private Long authorId;

    @NotBlank(message = "Author username must not be blank")
    private String authorUsername;

    @NotBlank(message = "Text must not be blank")
    private String text;

}
