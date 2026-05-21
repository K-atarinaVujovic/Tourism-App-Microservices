import apiClient from "@/lib/api-client";
import type { Blog, CreateBlog, Comment, CreateComment, UpdateComment } from "@/types/blog";

export async function getAllBlogs(): Promise<Blog[]> {
  const response = await apiClient.get<Blog[]>("/blog/blogs");
  return response.data;
}

export async function getBlog(blogId: number): Promise<Blog> {
  const response = await apiClient.get<Blog>(`/blog/blogs/${blogId}`);
  return response.data;
}

export async function createBlog(data: CreateBlog): Promise<Blog> {
  const response = await apiClient.post<Blog>("/blog/blogs", data);
  return response.data;
}

export async function getComments(blogId: number): Promise<Comment[]> {
  const response = await apiClient.get<Comment[]>(`/blog/blogs/${blogId}/comments`);
  return response.data;
}

export async function addComment(blogId: number, data: CreateComment): Promise<Comment> {
  const response = await apiClient.post<Comment>(`/blog/blogs/${blogId}/comments`, data);
  return response.data;
}

export async function editComment(blogId: number, commentId: number, data: UpdateComment): Promise<Comment> {
  const response = await apiClient.put<Comment>(`/blog/blogs/${blogId}/comments/${commentId}`, data);
  return response.data;
}

export async function getLikeCount(blogId: number): Promise<number> {
  const response = await apiClient.get<number>(`/blog/blogs/${blogId}/likes/count`);
  return response.data;
}

export async function hasLiked(blogId: number, userId: number): Promise<boolean> {
  const response = await apiClient.get<boolean>(`/blog/blogs/${blogId}/likes/has-liked`, {
    params: { userId },
  });
  return response.data;
}

export async function likeBlog(blogId: number, userId: number): Promise<void> {
  await apiClient.post(`/blog/blogs/${blogId}/likes`, null, { params: { userId } });
}

export async function unlikeBlog(blogId: number, userId: number): Promise<void> {
  await apiClient.delete(`/blog/blogs/${blogId}/likes`, { params: { userId } });
}