import { Link } from "react-router";
import { useAllBlogs } from "@/features/blog/hooks/useBlog";

export default function BlogListPage() {
  const { data: blogs, isLoading, isError } = useAllBlogs();

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError || !blogs) return <p className="p-4">Failed to load blogs.</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 space-y-2">
      {blogs.map((blog) => (
        <div key={blog.id} className="border rounded px-3 py-2">
          <Link to={`/blogs/${blog.id}`} className="text-sm font-medium hover:underline">
            {blog.title}
          </Link>
        </div>
      ))}
    </div>
  );
}