import { useState } from "react";
import { useRecommendations, useFollowUser, useUnfollowUser } from "../hooks/useFollower";

function RecommendedCard({ user }: { user: import("@/types/follower").User }) {
  const [followed, setFollowed] = useState(false);
  const { mutate: follow } = useFollowUser(user.user_id);
  const { mutate: unfollow } = useUnfollowUser(user.user_id);

  function handleToggle() {
    if (followed) {
      unfollow();
      setFollowed(false);
    } else {
      follow();
      setFollowed(true);
    }
  }

  return (
    <div className="flex items-center gap-3 border rounded px-3 py-2 min-w-48">
      <img
        src={user.imageUrl}
        alt={user.name}
        className="size-10 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name} {user.lastname}</p>
      </div>
      <button
        onClick={handleToggle}
        className="px-3 py-1 border text-xs rounded shrink-0"
      >
        {followed ? "Unfollow" : "Follow"}
      </button>
    </div>
  );
}

export default function RecommendedProfiles() {
  const { data: recommendations, isLoading } = useRecommendations();

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Recommended</p>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : !recommendations?.length ? (
        <p className="text-sm text-gray-500">No recommendations.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {recommendations.map((user) => (
            <RecommendedCard key={user.user_id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}