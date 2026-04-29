import { getCurrentDbUser } from "@/lib/auth";
import { getEvents } from "@/actions/events";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventStatusBadge } from "@/components/shared/status-badge";
import { BookletProgress } from "@/components/shared/booklet-progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CalendarDays, FileImage, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateEventDialog } from "@/components/admin/create-event-dialog";

export default async function OrganizerDashboardPage() {
  const user = await getCurrentDbUser();
  if (!user?.organizationId) return null;

  const events = await getEvents(user.organizationId);

  const allAds = await prisma.ad.findMany({
    where: { event: { organizationId: user.organizationId, deletedAt: null } },
  });

  const totalRevenue = allAds.reduce((s, a) => s + Number(a.amountPaid), 0);
  const pendingAds = allAds.filter((a) => a.adContentStatus === "pending").length;
  const unpaidAds = allAds.filter((a) => a.paymentStatus !== "received").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">{user.organization?.name}</p>
        </div>
        <CreateEventDialog organizations={[{ id: user.organizationId, name: user.organization?.name ?? "" }]} defaultOrgId={user.organizationId} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Events" value={events.length} icon={CalendarDays} />
        <StatCard title="Total Ads" value={allAds.length} icon={FileImage} description={`${pendingAds} in design`} />
        <StatCard title="Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} iconColor="text-green-600" />
        <StatCard title="Unpaid Ads" value={unpaidAds} icon={Clock} iconColor="text-yellow-500" />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Your Events</h3>
        {events.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
              <CalendarDays className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No events yet. Create your first event!</p>
              <CreateEventDialog organizations={[{ id: user.organizationId, name: user.organization?.name ?? "" }]} defaultOrgId={user.organizationId} />
            </CardContent>
          </Card>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            const eventAds = allAds.filter((a) => {
              return true;
            });
            return (
              <Card key={event.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{event.name}</CardTitle>
                      {event.eventDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(event.eventDate)}
                        </p>
                      )}
                    </div>
                    <EventStatusBadge status={event.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {event._count.ads} ad{event._count.ads !== 1 ? "s" : ""} submitted
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/events/${event.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">Manage</Button>
                    </Link>
                    <Link href={`/events/${event.id}/ads`} className="flex-1">
                      <Button size="sm" className="w-full">Submit Ad</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
