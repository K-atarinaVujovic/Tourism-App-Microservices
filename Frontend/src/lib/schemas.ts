import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  lastname: z.string().min(1, "Last name is required"),
  imageUrl: z.string(),
  biography: z.string().min(1, "Biography is required"),
  quote: z.string().min(1, "Quote is required"),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;