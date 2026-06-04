import { Link } from "react-router";
import { useAllBlogs } from "@/features/blog/hooks/useBlog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, User, ArrowRight, PenLine, AlertCircle, Loader2 } from "lucide-react";

export default function BlogListPage() {
  const { data: blogs, isLoading, isError } = useAllBlogs();

  if (isLoading) return <div className="flex items-center justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (isError || !blogs) return (
    <div className="container mx-auto p-12 text-center border-2 border-dashed rounded-xl flex flex-col items-center gap-3 mt-10">
      <AlertCircle className="h-10 w-10 text-destructive opacity-50" />
      <p className="text-destructive font-medium">Failed to load blogs.</p>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Community Blogs</h1>
        <p className="text-muted-foreground text-lg">
          Read stories and experiences from our travelers.
        </p>
        <div className="pt-2">
          <Button asChild>
            <Link to="/blogs/create">
              <PenLine className="h-4 w-4 mr-2" />
              Write a Blog
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <Card key={blog.id} className="group hover:border-primary/50 transition-all duration-300 flex flex-col">
            <CardHeader>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                <BookOpen className="h-3.5 w-3.5 text-primary" /> Blog Post
              </div>
              <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">{blog.title}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-2">
                <User className="h-3 w-3" /> Author ID: {blog.authorId}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                Click to read the full story and engage with the community...
              </p>
            </CardContent>
            <CardContent className="pt-0">
              <Button asChild variant="ghost" size="sm" className="px-0 text-primary hover:bg-transparent hover:underline group-hover:translate-x-1 transition-transform">
                <Link to={`/blogs/${blog.id}`} className="flex items-center gap-1.5">
                  Read More <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {blogs.length === 0 && (
        <div className="p-16 text-center border-2 border-dashed rounded-xl flex flex-col items-center gap-4">
          <BookOpen className="h-12 w-12 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground font-medium">No blogs have been written yet.</p>
          <Button asChild variant="outline" size="sm">
            <Link to="/blogs/create">Be the first to write one</Link>
          </Button>
        </div>
      )}
    </div>
  );
}