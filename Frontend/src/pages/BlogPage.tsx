import { useParams } from "react-router";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  useBlog, useComments, useAddComment, useEditComment,
  useLikeCount, useHasLiked, useLikeBlog, useUnlikeBlog,
} from "@/features/blog/hooks/useBlog";
import BlogHeader from "@/features/blog/components/BlogHeader";
import BlogImages from "@/features/blog/components/BlogImages";
import BlogActions from "@/features/blog/components/BlogActions";
import CommentForm from "@/features/blog/components/CommentForm";
import CommentItem from "@/features/blog/components/CommentItem";
import type { CommentFormValues } from "@/lib/schemas";

export default function BlogPage() {
  const { blogId } = useParams<{ blogId: string }>();
  const parsedBlogId = Number(blogId);
  const { user } = useAuthStore();

  const { data: blog, isLoading, isError } = useBlog(parsedBlogId);
  const { data: comments } = useComments(parsedBlogId);
  const { data: likeCount } = useLikeCount(parsedBlogId);
  const { data: liked } = useHasLiked(parsedBlogId, user?.id ?? 0);

  const { mutate: like } = useLikeBlog(parsedBlogId, user?.id ?? 0);
  const { mutate: unlike } = useUnlikeBlog(parsedBlogId, user?.id ?? 0);
  const { mutate: addComment } = useAddComment(parsedBlogId);
  const { mutate: editComment } = useEditComment(parsedBlogId);

  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError || !blog) return <p className="p-4">Failed to load blog.</p>;

  const isAuthor = user?.id === blog.authorId;

  function onComment(values: CommentFormValues) {
    if (!user) return;
    addComment({ authorId: user.id, authorUsername: user.username, text: values.text });
  }

  function onEditComment(commentId: number, text: string) {
    editComment({ commentId, data: { text } });
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 space-y-4">
      <BlogHeader title={blog.title} description={blog.description} />
      <BlogImages imageUrls={blog.imageUrls} />
      <CommentForm onSubmit={onComment} />
      <div className="space-y-3">
        {comments?.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isAuthor={user?.id === comment.authorId}
            onEdit={onEditComment}
          />
        ))}
      </div>
    </div>
  );
}