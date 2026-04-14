package com.tourism.blog.controller;

import com.tourism.blog.dto.BlogResponse;
import com.tourism.blog.dto.CreateBlogRequest;
import com.tourism.blog.service.BlogService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/blogs")
public class BlogController {

    private final BlogService blogService;

    public BlogController(BlogService blogService){
        this.blogService = blogService;
    }

    @PostMapping
    public BlogResponse createBlog(@Valid @RequestBody CreateBlogRequest request){
        return blogService.createBlog(request);
    }

    @GetMapping
    public List<BlogResponse> getAllBlogs(){
        return blogService.getAllBlogs();
    }

    @GetMapping("/{id}")
    public BlogResponse getBlogById(@PathVariable Long id){
        return blogService.getBlogById(id);
    }
}
