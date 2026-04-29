import { getEvent } from "@/actions/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventStatusBadge, AdStatusBadge, PaymentBadge } from "@/components/shared/status-badge";
import { BookletProgress } from "@/components/shared/booklet-progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, CalendarDays, MapPin, FileImage, Layout, DollarSign } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UpdateEventStatusSelect } from "@/components/admin/update-event-status";
import { EditEventDialog } from "@/components/admin/edit-event-dialog";

export default async function AdminEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const fullPageAds = event.ads.filter((a) => a.adType === "full_page").length;
  const halfPageAds = event.ads.filter((a) => a.adType === "half_page").length;
  const totalRevenue = event.ads.reduce((sum, a) => sum + Number(a.amountPaid), 0);
  const totalExpected = event.ads.reduce((sum, a) => sum + Number(a.paymentAmount), 0);
  const pendingAds = event.ads.filter((a) => a.adContentStatus === "pending").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/events">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{event.name}</h2>
            <EventStatusBadge status={event.status} />
          </div>
          <p className="text-muted-foreground">{event.organization.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <EditEventDialog event={event} />
          <UpdateEventStatusSelect eventId={id} currentStatus={event.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {event.eventDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(event.eventDate)}
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              )}
              {event.theme && <p className="text-muted-foreground">Theme: {event.theme}</p>}
              {event.notes && <p className="text-muted-foreground text-xs">{event.notes}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <BookletProgress
                totalPages={event.totalPages}
                frontSectionPages={event.frontSectionPages}
                fullPageAds={fullPageAds}
                halfPageAds={halfPageAds}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Expected</span>
                <span className="font-medium">{formatCurrency(totalExpected)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Collected</span>
                <span className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Outstanding</span>
                <span className="font-medium text-yellow-600">{formatCurrency(totalExpected - totalRevenue)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/admin/events/${id}/ads`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <FileImage className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-semibold">{event.ads.length}</p>
                    <p className="text-xs text-muted-foreground">Total Ads ({pendingAds} pending)</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/admin/events/${id}/front-section`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Layout className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="font-semibold">{event.frontContents.length}</p>
                    <p className="text-xs text-muted-foreground">Front Section Items</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">Ads ({event.ads.length})</CardTitle>
              <Link href={`/admin/events/${id}/ads`}>
                <Button variant="outline" size="sm">Manage Ads</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {event.ads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No ads submitted yet</p>
              ) : (
                <div className="space-y-2">
                  {event.ads.slice(0, 8).map((ad) => (
                    <div key={ad.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{ad.adCode}</span>
                          <span className="text-sm font-medium">{ad.advertiserName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {ad.adType === "full_page" ? "Full page" : "Half page"} · {formatCurrency(Number(ad.paymentAmount))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AdStatusBadge status={ad.adContentStatus} />
                        <PaymentBadge status={ad.paymentStatus} />
                        <Link href={`/admin/events/${id}/ads/${ad.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {event.ads.length > 8 && (
                    <div className="pt-2 text-center">
                      <Link href={`/admin/events/${id}/ads`}>
                        <Button variant="ghost" size="sm">View all {event.ads.length} ads</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
