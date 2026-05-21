interface BlogActionsProps {
  liked: boolean;
  likeCount: number;
  onLike: () => void;
  onUnlike: () => void;
}

export default function BlogActions({ liked, likeCount, onLike, onUnlike }: BlogActionsProps) {
  return (
    <div className="flex justify-end items-center gap-2">
      <button
        onClick={() => liked ? onUnlike() : onLike()}
        className="px-4 py-2 border text-sm rounded"
      >
        {liked ? "Unlike" : "Like"}
      </button>
      <span className="text-sm">{likeCount}</span>
    </div>
  );
}