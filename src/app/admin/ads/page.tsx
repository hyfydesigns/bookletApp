import { getAllAds } from "@/actions/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdStatusBadge, PaymentBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileImage, Clock } from "lucide-react";
import Link from "next/link";
import { AdStatusFilter } from "@/components/admin/ad-status-filter";

export default async function GlobalAdsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; payment?: string }>;
}) {
  const { status, payment } = await searchParams;

  const ads = await getAllAds({
    adContentStatus: status,
    paymentStatus: payment,
  });

  const pendingCount = ads.filter((a) => a.adContentStatus === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Ad Queue</h2>
        <p className="text-muted-foreground">
          {ads.length} ad{ads.length !== 1 ? "s" : ""} · {pendingCount} pending action
        </p>
      </div>

      <AdStatusFilter currentStatus={status} currentPayment={payment} />

      {ads.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-3">
            <FileImage className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No ads match the current filters</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {ads.map((ad) => (
          <Card key={ad.id} className={`hover:border-primary/50 transition-colors ${ad.adContentStatus === "pending" ? "border-yellow-200" : ""}`}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{ad.adCode}</span>
                    <span className="font-medium">{ad.advertiserName}</span>
                    {ad.adContentStatus === "pending" && (
                      <Clock className="h-3.5 w-3.5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span>{ad.event.organization.name}</span>
                    <span>·</span>
                    <span>{ad.event.name}</span>
                    <span>·</span>
                    <span className="capitalize">{ad.adType.replace("_", " ")}</span>
                    <span>·</span>
                    <span>{formatDate(ad.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <AdStatusBadge status={ad.adContentStatus} />
                  <PaymentBadge status={ad.paymentStatus} />
                  <span className="text-sm font-medium">{formatCurrency(Number(ad.paymentAmount))}</span>
                  <Link href={`/admin/events/${ad.eventId}/ads/${ad.id}`}>
                    <Button variant="outline" size="sm">Manage</Button>
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
