import { getBackups, restoreBackup, deleteBackup } from "@/actions/backups";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArchiveRestore, Building2, CalendarDays, Trash2 } from "lucide-react";
import { RestoreBackupButton, DeleteBackupButton } from "./actions";

export default async function BackupsPage() {
  const backups = await getBackups();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Backups</h2>
        <p className="text-muted-foreground">
          {backups.length} backup{backups.length !== 1 ? "s" : ""} — restore any deleted organization or event
        </p>
      </div>

      {backups.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-3">
            <ArchiveRestore className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">No backups yet</p>
              <p className="text-sm text-muted-foreground">
                Backups are created automatically when you delete an organization or event
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {backups.map((backup) => {
          const data = backup.data as Record<string, unknown>;
          const isOrg = backup.type === "organization";
          const eventsCount = isOrg ? ((data.events as unknown[]) ?? []).length : null;
          const adsCount = isOrg
            ? ((data.events as Array<{ ads: unknown[] }>) ?? []).reduce((s, e) => s + (e.ads?.length ?? 0), 0)
            : ((data.ads as unknown[]) ?? []).length;

          return (
            <Card key={backup.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                      {isOrg ? (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{backup.name}</p>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {isOrg ? "Organization" : "Event"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {eventsCount !== null && `${eventsCount} event${eventsCount !== 1 ? "s" : ""} · `}
                        {adsCount} ad{adsCount !== 1 ? "s" : ""} ·{" "}
                        Backed up {new Date(backup.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}{" "}
                        by {backup.createdBy.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RestoreBackupButton id={backup.id} name={backup.name} />
                    <DeleteBackupButton id={backup.id} name={backup.name} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
