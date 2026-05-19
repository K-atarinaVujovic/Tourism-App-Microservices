import { useAdminUsers, useBlockUser, useUnblockUser } from "@/features/auth/hooks/useAdminUsers";

export default function AdminUsersPage() {
  const { data: users, isLoading, isError } = useAdminUsers();
  const { mutate: blockUser, isPending: isBlocking } = useBlockUser();
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUser();

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError || !users) return <p className="p-4">Failed to load users.</p>;

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 space-y-3">
      <h1 className="text-lg font-semibold">Users</h1>
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between border rounded px-3 py-2 text-sm">
          <div>
            <p className="font-medium">{user.username}</p>
            <p className="text-gray-500 text-xs">{user.email}</p>
          </div>
          <button
            disabled={isBlocking || isUnblocking}
            onClick={() => user.is_blocked ? unblockUser(user.id) : blockUser(user.id)}
            className="px-3 py-1 border rounded text-xs disabled:opacity-50"
          >
            {user.is_blocked ? "Unblock" : "Block"}
          </button>
        </div>
      ))}
    </div>
  );
}