import { getAds } from "@/actions/ads";
import { getEvent } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdStatusBadge, PaymentBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SubmitAdDialog } from "@/components/organizer/submit-ad-dialog";

export default async function OrganizerAdsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, ads] = await Promise.all([getEvent(id), getAds(id)]);
  if (!event) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/events/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Ads</h2>
          <p className="text-muted-foreground">{event.name} · {ads.length} submitted</p>
        </div>
        <SubmitAdDialog eventId={id} />
      </div>

      {ads.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <Plus className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">No ads submitted yet</p>
              <p className="text-sm text-muted-foreground">Submit your first ad for this event</p>
            </div>
            <SubmitAdDialog eventId={id} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {ads.map((ad) => (
          <Card key={ad.id} className="hover:border-primary/50 transition-colors">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{ad.adCode}</span>
                    <span className="font-medium">{ad.advertiserName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="capitalize">{ad.adType.replace("_", " ")}</span>
                    <span>{formatCurrency(Number(ad.paymentAmount))}</span>
                    {ad.pageNumber && <span>Page {ad.pageNumber}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <AdStatusBadge status={ad.adContentStatus} />
                  <PaymentBadge status={ad.paymentStatus} />
                  <Link href={`/events/${id}/ads/${ad.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
