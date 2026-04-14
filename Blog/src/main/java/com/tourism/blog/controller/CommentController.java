package com.tourism.blog.controller;

import com.tourism.blog.dto.CommentResponse;
import com.tourism.blog.dto.CreateCommentRequest;
import com.tourism.blog.dto.UpdateCommentRequest;
import com.tourism.blog.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/blogs/{blogId}/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService){
        this.commentService = commentService;
    }

    @PostMapping
    public CommentResponse createComment(@PathVariable Long blogId,
                                         @Valid @RequestBody CreateCommentRequest request){
        return commentService.createComment(blogId, request);
    }

    @GetMapping
    public List<CommentResponse> getCommentsByBlogId(@PathVariable Long blogId){
        return commentService.getCommentsByBlogId(blogId);
    }

    @PutMapping("/{commentId}")
    public CommentResponse updateComment(@PathVariable Long blogId, @PathVariable Long commentId,
                                         @Valid @RequestBody UpdateCommentRequest request){
        return commentService.updateComment(blogId, commentId, request);
    }

}
