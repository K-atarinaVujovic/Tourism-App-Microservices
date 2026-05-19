import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBlogSchema, type CreateBlogFormValues } from "@/lib/schemas";
import { useCreateBlog } from "@/features/blog/hooks/useBlog";
import { useAuthStore } from "@/store/authStore";

export default function CreateBlogPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { mutate: createBlog, isPending } = useCreateBlog();

  const { register, handleSubmit, formState: { errors } } = useForm<CreateBlogFormValues>({
    resolver: zodResolver(createBlogSchema),
  });

  function onSubmit(values: CreateBlogFormValues) {
    if (!user) return;
    createBlog(
      {
        authorId: user.id,
        title: values.title,
        description: values.description,
        imageUrls: values.imageUrls.split(",").map((url) => url.trim()).filter(Boolean),
      },
      { onSuccess: (blog) => navigate(`/blogs/${blog.id}`) }
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 space-y-4">
      <h1 className="text-xl font-semibold text-center">Create Blog</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Title</label>
          <input {...register("title")} className="border rounded px-3 py-1.5 text-sm" />
          {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Description</label>
          <textarea
            {...register("description")}
            rows={8}
            placeholder="Supports markdown..."
            className="border rounded px-3 py-1.5 text-sm w-full font-mono"
          />
          {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Image URLs (comma separated)</label>
          <input {...register("imageUrls")} className="border rounded px-3 py-1.5 text-sm" />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-black text-white text-sm rounded disabled:opacity-50"
        >
          {isPending ? "Publishing..." : "Publish"}
        </button>
      </form>
    </div>
  );
}