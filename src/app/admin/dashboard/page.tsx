import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdStatusBadge, EventStatusBadge, PaymentBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Building2, CalendarDays, FileImage, DollarSign, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [orgCount, eventCount, adStats, recentAds, recentEvents, totalRevenue] =
    await Promise.all([
      prisma.organization.count({ where: { deletedAt: null } }),
      prisma.event.count({ where: { deletedAt: null } }),
      prisma.ad.groupBy({
        by: ["adContentStatus"],
        _count: { _all: true },
      }),
      prisma.ad.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { event: { include: { organization: { select: { name: true } } } } },
      }),
      prisma.event.findMany({
        take: 5,
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: { organization: { select: { name: true } }, _count: { select: { ads: true } } },
      }),
      prisma.ad.aggregate({ _sum: { amountPaid: true } }),
    ]);

  const pendingAds = adStats.find((s) => s.adContentStatus === "pending")?._count._all ?? 0;
  const designingAds = adStats.find((s) => s.adContentStatus === "designing")?._count._all ?? 0;
  const completeAds = adStats.find((s) => s.adContentStatus === "complete")?._count._all ?? 0;
  const totalAds = pendingAds + designingAds + completeAds;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Overview of all booklet activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Organizations" value={orgCount} icon={Building2} description="Active organizations" />
        <StatCard title="Events" value={eventCount} icon={CalendarDays} description="All time events" />
        <StatCard title="Total Ads" value={totalAds} icon={FileImage} description={`${pendingAds} pending`} />
        <StatCard
          title="Revenue Collected"
          value={formatCurrency(Number(totalRevenue._sum.amountPaid ?? 0))}
          icon={DollarSign}
          iconColor="text-green-600"
          description="Total payments received"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ad Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Pending</span>
              </div>
              <span className="font-bold">{pendingAds}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileImage className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Designing</span>
              </div>
              <span className="font-bold">{designingAds}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Complete</span>
              </div>
              <span className="font-bold">{completeAds}</span>
            </div>
            <div className="pt-2">
              <Link href="/admin/ads">
                <Button variant="outline" size="sm" className="w-full">View Ad Queue</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Recent Ads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAds.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No ads yet</p>
              )}
              {recentAds.map((ad) => (
                <div key={ad.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{ad.advertiserName}</p>
                    <p className="text-xs text-muted-foreground">{ad.event.name} · {ad.adCode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AdStatusBadge status={ad.adContentStatus} />
                    <Link href={`/admin/events/${ad.eventId}/ads/${ad.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
          <Link href="/admin/events">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No events yet</p>
            )}
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{event.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.organization.name} · {event._count.ads} ads
                    {event.eventDate ? ` · ${formatDate(event.eventDate)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <EventStatusBadge status={event.status} />
                  <Link href={`/admin/events/${event.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
