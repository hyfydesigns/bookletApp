import { getNotifications } from "@/actions/notifications";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { MarkAllReadButton } from "@/components/shared/mark-all-read";
import { Topbar } from "@/components/shared/topbar";
import { Sidebar } from "@/components/shared/sidebar";

export default async function NotificationsPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");

  const notifications = await getNotifications();
  const unread = notifications.filter((n) => !n.isRead).length;

  const typeIcon: Record<string, string> = {
    new_ad: "📄",
    new_content: "📝",
    ad_status_change: "🔄",
    payment_update: "💰",
    new_event: "📅",
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={user.role} orgName={user.organization?.name} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="Notifications" unreadCount={unread} />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Notifications</h2>
                <p className="text-muted-foreground">{unread} unread</p>
              </div>
              {unread > 0 && <MarkAllReadButton />}
            </div>

            {notifications.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 space-y-3">
                  <Bell className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {notifications.map((n) => (
                <Card key={n.id} className={!n.isRead ? "border-primary/40 bg-primary/5" : ""}>
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{typeIcon[n.type] ?? "🔔"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{n.title}</p>
                          {!n.isRead && (
                            <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 ml-2" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{n.message}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-xs text-muted-foreground">{formatDate(n.createdAt)}</p>
                          {n.link && (
                            <Link href={n.link} className="text-xs text-blue-600 hover:underline">
                              View →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
