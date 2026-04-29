import { getUsers } from "@/actions/users";
import { getOrganizations } from "@/actions/organizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { UserRoleManager } from "@/components/admin/user-role-manager";

export default async function UsersPage() {
  const [users, orgs] = await Promise.all([getUsers(), getOrganizations()]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Users</h2>
        <p className="text-muted-foreground">{users.length} registered users</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">No users yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{user.name}</p>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {user.organization && (
                      <p className="text-xs text-muted-foreground">{user.organization.name}</p>
                    )}
                  </div>
                  <UserRoleManager
                    userId={user.id}
                    currentRole={user.role}
                    organizations={orgs}
                    currentOrgId={user.organizationId ?? undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
