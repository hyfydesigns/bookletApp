import { getEvent } from "@/actions/events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventStatusBadge, AdStatusBadge, PaymentBadge } from "@/components/shared/status-badge";
import { BookletProgress } from "@/components/shared/booklet-progress";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, CalendarDays, MapPin, FileImage, Layout } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OrganizerEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const fullPageAds = event.ads.filter((a) => a.adType === "full_page").length;
  const halfPageAds = event.ads.filter((a) => a.adType === "half_page").length;
  const totalRevenue = event.ads.reduce((sum, a) => sum + Number(a.amountPaid), 0);
  const totalExpected = event.ads.reduce((sum, a) => sum + Number(a.paymentAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{event.name}</h2>
            <EventStatusBadge status={event.status} />
          </div>
          <p className="text-muted-foreground">{event.organization.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Event Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {event.eventDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />{formatDate(event.eventDate)}
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />{event.location}
                </div>
              )}
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
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Revenue Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Collected</span>
                <span className="font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Outstanding</span>
                <span className="font-medium">{formatCurrency(totalExpected - totalRevenue)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/events/${id}/ads`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <FileImage className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-semibold">{event.ads.length}</p>
                    <p className="text-xs text-muted-foreground">Ads · Add New</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href={`/events/${id}/front-section`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <Layout className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="font-semibold">{event.frontContents.filter((c) => c.status === "done").length}/{event.frontSectionPages}</p>
                    <p className="text-xs text-muted-foreground">Front Section</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">Submitted Ads</CardTitle>
              <Link href={`/events/${id}/ads`}>
                <Button size="sm">+ Submit Ad</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {event.ads.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground text-sm">No ads submitted yet</p>
                  <Link href={`/events/${id}/ads`}>
                    <Button size="sm" className="mt-3">Submit First Ad</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {event.ads.map((ad) => (
                    <div key={ad.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{ad.adCode}</span>
                          <span className="text-sm font-medium">{ad.advertiserName}</span>
                        </div>
                        <span className="text-xs text-muted-foreground capitalize">
                          {ad.adType.replace("_", " ")} · {formatCurrency(Number(ad.paymentAmount))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AdStatusBadge status={ad.adContentStatus} />
                        <PaymentBadge status={ad.paymentStatus} />
                        <Link href={`/events/${id}/ads/${ad.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
