import { useState } from "react";
import { useFollowUser, useUnfollowUser } from "../hooks/useFollower";
import type { User } from "@/types/follower";

function UserCard({ user, initialFollowed }: { user: User; initialFollowed: boolean }) {
  const [followed, setFollowed] = useState(initialFollowed);
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
    <div className="flex items-center gap-3 border rounded px-3 py-2">
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

interface UserListProps {
  users: User[];
  isLoading: boolean;
  emptyMessage: string;
  defaultFollowed?: boolean;
}


export default function UserList({ users, isLoading, emptyMessage, defaultFollowed = false  }: UserListProps) {
  if (isLoading) return <p className="text-sm text-gray-500 p-4">Loading...</p>;
  if (!users.length) return <p className="text-sm text-gray-500 p-4">{emptyMessage}</p>;

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <UserCard key={user.user_id} user={user} initialFollowed={defaultFollowed} />
      ))}
    </div>
  );
}