import { useState } from "react";
import type { Comment } from "@/types/blog";

interface CommentItemProps {
  comment: Comment;
  isAuthor: boolean;
  onEdit: (commentId: number, text: string) => void;
}

export default function CommentItem({ comment, isAuthor, onEdit }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState(comment.text);

  function handleSave() {
    onEdit(comment.id, editingText);
    setIsEditing(false);
  }

  return (
    <div className="border rounded px-3 py-2 space-y-1">
      <p className="text-sm font-medium">{comment.authorUsername}</p>
      {isEditing ? (
        <div className="flex gap-2">
          <input
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            className="border rounded px-3 py-1.5 text-sm flex-1"
          />
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-black text-white text-xs rounded"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 border text-xs rounded"
          >
            Cancel
          </button>
        </div>
      ) : (
        <p className="text-sm">{comment.text}</p>
      )}
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          <span>Created: {new Date(comment.createdAt).toLocaleDateString()}</span>
          {comment.updatedAt && (
            <span className="ml-2">Edited: {new Date(comment.updatedAt).toLocaleDateString()}</span>
          )}
        </div>
        {isAuthor && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs border rounded px-2 py-1"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}