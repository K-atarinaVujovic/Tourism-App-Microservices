import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, type CommentFormValues } from "@/lib/schemas";

interface CommentFormProps {
  onSubmit: (values: CommentFormValues) => void;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
  });

  function handleComment(values: CommentFormValues) {
    onSubmit(values);
    reset();
  }

  return (
    <div className="space-y-1">
      <form onSubmit={handleSubmit(handleComment)} className="flex gap-2">
        <input
          {...register("text")}
          placeholder="Write a comment..."
          className="border rounded px-3 py-1.5 text-sm flex-1"
        />
        <button type="submit" className="px-4 py-2 bg-black text-white text-sm rounded">
          Comment
        </button>
      </form>
      {errors.text && <span className="text-xs text-red-500">{errors.text.message}</span>}
    </div>
  );
}