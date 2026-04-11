package com.tourism.blog.service;

import com.tourism.blog.dto.CommentResponse;
import com.tourism.blog.dto.CreateCommentRequest;
import com.tourism.blog.dto.UpdateCommentRequest;
import com.tourism.blog.entity.Blog;
import com.tourism.blog.entity.Comment;
import com.tourism.blog.repository.BlogRepository;
import com.tourism.blog.repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final BlogRepository blogRepository;

    public CommentService(CommentRepository commentRepository, BlogRepository blogRepository){
        this.commentRepository = commentRepository;
        this.blogRepository = blogRepository;
    }

    public CommentResponse createComment(Long blogId, CreateCommentRequest request){
        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new RuntimeException("Blog not found with id: " + blogId));

        Comment comment = new Comment();

        comment.setBlogId(blog.getId());
        comment.setAuthorId(request.getAuthorId());
        comment.setAuthorUsername(request.getAuthorUsername());
        comment.setText(request.getText());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setUpdatedAt(LocalDateTime.now());

        Comment savedComment = commentRepository.save(comment);

        return mapToResponse(savedComment);
    }

    public List<CommentResponse> getCommentsByBlogId(Long blogId){
        return commentRepository.findByBlogId(blogId)
                .stream()
                .map(this::mapToResponse)       //mapira comment u response, jer find vraca comment
                .toList();
    }

    public CommentResponse updateComment(Long blogId, Long commentId, UpdateCommentRequest request){
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        if(!comment.getBlogId().equals(blogId)){
            throw new RuntimeException("Comment does not belong to blog with id: " + blogId);
        }
        comment.setText(request.getText());
        comment.setUpdatedAt(LocalDateTime.now());

        Comment updatedComment = commentRepository.save(comment);

        return mapToResponse(updatedComment);
    }

    public CommentResponse mapToResponse(Comment comment){
        return new CommentResponse(
                comment.getId(),
                comment.getBlogId(),
                comment.getAuthorId(),
                comment.getAuthorUsername(),
                comment.getText(),
                comment.getCreatedAt(),
                comment.getUpdatedAt()
        );
    }

}
