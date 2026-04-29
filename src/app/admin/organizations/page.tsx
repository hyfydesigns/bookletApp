import { getOrganizations } from "@/actions/organizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Building2, Plus, Users, CalendarDays } from "lucide-react";
import { CreateOrgDialog } from "@/components/admin/create-org-dialog";
import { DeleteWithBackupDialog } from "@/components/admin/delete-with-backup-dialog";

export default async function OrganizationsPage() {
  const orgs = await getOrganizations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organizations</h2>
          <p className="text-muted-foreground">{orgs.length} organization{orgs.length !== 1 ? "s" : ""}</p>
        </div>
        <CreateOrgDialog />
      </div>

      {orgs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <Building2 className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">No organizations yet</p>
              <p className="text-sm text-muted-foreground">Create your first organization to get started</p>
            </div>
            <CreateOrgDialog />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orgs.map((org) => (
          <Card key={org.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {org.logoUrl ? (
                    <img src={org.logoUrl} alt={org.name} className="h-10 w-10 rounded-md object-cover flex-shrink-0" />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{org.name}</CardTitle>
                    {org.contactPerson && (
                      <p className="text-xs text-muted-foreground truncate">{org.contactPerson}</p>
                    )}
                  </div>
                </div>
                <DeleteWithBackupDialog
                  type="organization"
                  id={org.id}
                  name={org.name}
                  summary={`${org._count.events} event${org._count.events !== 1 ? "s" : ""} · ${org._count.users} user${org._count.users !== 1 ? "s" : ""}`}
                  redirectTo="/admin/organizations"
                  variant="icon"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {org._count.events} event{org._count.events !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {org._count.users} user{org._count.users !== 1 ? "s" : ""}
                </span>
              </div>
              {org.email && <p className="text-xs text-muted-foreground truncate">{org.email}</p>}
              <Link href={`/admin/organizations/${org.id}`}>
                <Button variant="outline" size="sm" className="w-full">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
