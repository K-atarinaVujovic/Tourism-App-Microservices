import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  lastname: z.string().min(1, "Last name is required"),
  imageUrl: z.string(),
  biography: z.string().min(1, "Biography is required"),
  quote: z.string().min(1, "Quote is required"),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;


export const createBlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrls: z.string(), // comma separated, split on submit
});
export type CreateBlogFormValues = z.infer<typeof createBlogSchema>;

export const commentSchema = z.object({
  text: z.string().min(1, "Comment cannot be empty"),
});
export type CommentFormValues = z.infer<typeof commentSchema>;