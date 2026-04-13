package com.tourism.blog.controller;

import com.tourism.blog.service.LikeService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/blogs/{blogId}/likes")
public class LikeController {
    private final LikeService likeService;

    public LikeController(LikeService likeService){
        this.likeService = likeService;
    }

    @PostMapping
    public String likeBlog(@PathVariable Long blogId, @RequestParam Long userId){
        likeService.likeBlog(blogId, userId);
        return "Blog successfully liked!";
    }

    @DeleteMapping
    public String unlikeBlog(@PathVariable Long blogId, @RequestParam Long userId){
        likeService.unlikeBlog(blogId, userId);
        return "Blog successfully unliked!";
    }

    @GetMapping("/count")
    public int countLikes(@PathVariable Long blogId){
        return likeService.countLikes(blogId);
    }
}
