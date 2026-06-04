import { useAdminUsers, useBlockUser, useUnblockUser } from "@/features/auth/hooks/useAdminUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, ShieldAlert, ShieldCheck, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function AdminUsersPage() {
  const { data: users, isLoading, isError } = useAdminUsers();
  const { mutate: blockUser, isPending: isBlocking } = useBlockUser();
  const { mutate: unblockUser, isPending: isUnblocking } = useUnblockUser();
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return <div className="p-8 text-center">Loading users...</div>;
  if (isError || !users) return <div className="p-8 text-center text-red-500">Failed to load users.</div>;

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground text-lg">
          Manage user access and account status.
        </p>
      </div>

      <div className="flex justify-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search users..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="group hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center ${user.is_blocked ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    <User className={`h-6 w-6 ${user.is_blocked ? 'text-destructive' : 'text-primary'}`} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-lg">{user.username}</p>
                      {user.is_blocked ? (
                        <Badge variant="destructive">Blocked</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <Button 
                    variant={user.is_blocked ? "outline" : "destructive"} 
                    size="sm"
                    className="gap-2"
                    disabled={isBlocking || isUnblocking}
                    onClick={() => user.is_blocked ? unblockUser(user.id) : blockUser(user.id)}
                  >
                    {user.is_blocked ? (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Unblock User
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4" />
                        Block User
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}