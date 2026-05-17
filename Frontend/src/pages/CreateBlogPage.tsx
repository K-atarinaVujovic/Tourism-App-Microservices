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
        {(["title", "description"] as const).map((field) => (
          <div key={field} className="flex flex-col gap-1">
            <label className="text-sm font-medium capitalize">{field}</label>
            <input {...register(field)} className="border rounded px-3 py-1.5 text-sm" />
            {errors[field] && <span className="text-xs text-red-500">{errors[field]?.message}</span>}
          </div>
        ))}
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