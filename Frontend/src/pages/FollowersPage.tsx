import { useSearchParams } from "react-router";
import { useFollowers, useFollowing } from "@/features/followers/hooks/useFollower";
import UserList from "@/features/followers/components/UserList";

export default function FollowersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? "followers";

  const { data: followers = [], isLoading: loadingFollowers } = useFollowers();
  const { data: following = [], isLoading: loadingFollowing } = useFollowing();

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 space-y-4">
      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() => setSearchParams({ tab: "followers" })}
          className={`text-sm pb-1 ${tab === "followers" ? "font-semibold border-b-2 border-black" : "text-gray-500"}`}
        >
          Followers
        </button>
        <button
          onClick={() => setSearchParams({ tab: "following" })}
          className={`text-sm pb-1 ${tab === "following" ? "font-semibold border-b-2 border-black" : "text-gray-500"}`}
        >
          Following
        </button>
      </div>

      {tab === "followers" ? (
        <UserList users={followers} isLoading={loadingFollowers} emptyMessage="No followers yet." defaultFollowed={false} />
      ) : (
        <UserList users={following} isLoading={loadingFollowing} emptyMessage="Not following anyone." defaultFollowed={true} />
      )}
    </div>
  );
}