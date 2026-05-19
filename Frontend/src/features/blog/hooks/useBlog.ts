import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllBlogs, getBlog, createBlog,
  getComments, addComment, editComment,
  getLikeCount, hasLiked, likeBlog, unlikeBlog,
} from "../services/blogService";
import { getFollowerBlogs } from "@/features/followers/services/followerService";
import type { CreateBlog, CreateComment, UpdateComment } from "@/types/blog";

export function useAllBlogs() {
  return useQuery({ queryKey: ["blogs"], queryFn: getFollowerBlogs });
}

export function useBlog(blogId: number) {
  return useQuery({ queryKey: ["blog", blogId], queryFn: () => getBlog(blogId) });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBlog) => createBlog(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["blogs"] }),
    onError: () => alert("Failed to create blog."),
  });
}

export function useComments(blogId: number) {
  return useQuery({ queryKey: ["comments", blogId], queryFn: () => getComments(blogId) });
}

export function useAddComment(blogId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateComment) => addComment(blogId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", blogId] }),
    onError: () => alert("Failed to post comment."),
  });
}

export function useEditComment(blogId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, data }: { commentId: number; data: UpdateComment }) =>
      editComment(blogId, commentId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comments", blogId] }),
    onError: () => alert("Failed to edit comment."),
  });
}

export function useLikeCount(blogId: number) {
  return useQuery({ queryKey: ["likes", blogId], queryFn: () => getLikeCount(blogId) });
}

export function useHasLiked(blogId: number, userId: number) {
  return useQuery({ queryKey: ["has-liked", blogId, userId], queryFn: () => hasLiked(blogId, userId) });
}

export function useLikeBlog(blogId: number, userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => likeBlog(blogId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes", blogId] });
      queryClient.invalidateQueries({ queryKey: ["has-liked", blogId, userId] });
    },
    onError: () => alert("Failed to like blog."),
  });
}

export function useUnlikeBlog(blogId: number, userId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unlikeBlog(blogId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likes", blogId] });
      queryClient.invalidateQueries({ queryKey: ["has-liked", blogId, userId] });
    },
    onError: () => alert("Failed to unlike blog."),
  });
}