import { useSearchParams } from "react-router";
import { useFollowers, useFollowing } from "@/features/followers/hooks/useFollower";
import UserList from "@/features/followers/components/UserList";
import { Button } from "@/components/ui/button";
import { Users, UserCheck, Search } from "lucide-react";

export default function FollowersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? "followers";

  const { data: followers = [], isLoading: loadingFollowers } = useFollowers();
  const { data: following = [], isLoading: loadingFollowing } = useFollowing();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Social Network</h1>
        <p className="text-muted-foreground text-lg">
          Manage your followers and the people you follow.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
          <Button
            variant={tab === "followers" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSearchParams({ tab: "followers" })}
            className="gap-2"
          >
            <Users className="h-4 w-4" />
            Followers
            {followers.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-background/20 text-[10px] font-bold">
                {followers.length}
              </span>
            )}
          </Button>
          <Button
            variant={tab === "following" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSearchParams({ tab: "following" })}
            className="gap-2"
          >
            <UserCheck className="h-4 w-4" />
            Following
            {following.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-background/20 text-[10px] font-bold">
                {following.length}
              </span>
            )}
          </Button>
        </div>

        <div className="grid gap-6">
          {tab === "followers" ? (
            <UserList 
              users={followers} 
              isLoading={loadingFollowers} 
              emptyMessage="No followers yet." 
              defaultFollowed={false} 
            />
          ) : (
            <UserList 
              users={following} 
              isLoading={loadingFollowing} 
              emptyMessage="Not following anyone yet." 
              defaultFollowed={true} 
            />
          )}
        </div>
      </div>
    </div>
  );
}