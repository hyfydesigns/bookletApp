import { getAds } from "@/actions/ads";
import { getEvent } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdStatusBadge, PaymentBadge } from "@/components/shared/status-badge";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, FileImage, DollarSign, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdStatusFilter } from "@/components/admin/ad-status-filter";

export default async function EventAdsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string; payment?: string }>;
}) {
  const { id } = await params;
  const { status, payment } = await searchParams;
  const [event, ads] = await Promise.all([getEvent(id), getAds(id)]);
  if (!event) notFound();

  const filtered = ads.filter((ad) => {
    if (status && ad.adContentStatus !== status) return false;
    if (payment && ad.paymentStatus !== payment) return false;
    return true;
  });

  const totalRevenue = ads.reduce((s, a) => s + Number(a.amountPaid), 0);
  const totalExpected = ads.reduce((s, a) => s + Number(a.paymentAmount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/events/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Ads</h2>
          <p className="text-muted-foreground">{event.name} · {ads.length} total ads</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-6 w-6 text-yellow-500" />
            <div>
              <p className="font-bold">{ads.filter((a) => a.adContentStatus === "pending").length}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <div>
              <p className="font-bold">{ads.filter((a) => a.adContentStatus === "complete").length}</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-6 w-6 text-blue-500" />
            <div>
              <p className="font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">of {formatCurrency(totalExpected)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <AdStatusFilter currentStatus={status} currentPayment={payment} eventId={id} />

      {filtered.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No ads match the current filters</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {filtered.map((ad) => (
          <Card key={ad.id} className="hover:border-primary/50 transition-colors">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{ad.adCode}</span>
                    <span className="font-medium">{ad.advertiserName}</span>
                    <span className="text-xs text-muted-foreground">
                      {ad.adType === "full_page" ? "Full Page" : "Half Page"}
                    </span>
                    {ad.pageNumber && (
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded">Pg {ad.pageNumber}</span>
                    )}
                  </div>
                  {ad.contactEmail && (
                    <p className="text-xs text-muted-foreground mt-0.5">{ad.contactEmail}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <AdStatusBadge status={ad.adContentStatus} />
                  <PaymentBadge status={ad.paymentStatus} />
                  <span className="text-sm font-medium">{formatCurrency(Number(ad.paymentAmount))}</span>
                  <Link href={`/admin/events/${id}/ads/${ad.id}`}>
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
