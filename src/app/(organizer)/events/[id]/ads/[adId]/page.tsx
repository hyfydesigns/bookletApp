import { getAd } from "@/actions/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdStatusBadge, PaymentBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, ExternalLink, Download, BookOpen } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrganizerPaymentUpdate } from "@/components/organizer/payment-update";

export default async function OrganizerAdDetailPage({
  params,
}: {
  params: Promise<{ id: string; adId: string }>;
}) {
  const { id, adId } = await params;
  const ad = await getAd(adId);
  if (!ad) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/events/${id}/ads`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{ad.adCode}</span>
            <h2 className="text-xl font-bold">{ad.advertiserName}</h2>
          </div>
          <p className="text-muted-foreground capitalize">{ad.adType.replace("_", " ")} Ad</p>
        </div>
        <div className="flex items-center gap-2">
          <AdStatusBadge status={ad.adContentStatus} />
          <PaymentBadge status={ad.paymentStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Ad Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="capitalize">{ad.adType.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-semibold">{formatCurrency(Number(ad.paymentAmount))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <AdStatusBadge status={ad.adContentStatus} />
            </div>
            {ad.pageNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assigned Page</span>
                <span className="font-medium flex items-center gap-1">
                  <BookOpen className="h-4 w-4" /> Page {ad.pageNumber}
                  {ad.adType === "half_page" && ` (${ad.pageSlot === "top" ? "Top" : "Bottom"})`}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Submitted</span>
              <span>{formatDate(ad.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        <OrganizerPaymentUpdate
          adId={ad.id}
          paymentStatus={ad.paymentStatus}
          amountPaid={Number(ad.amountPaid)}
          paymentAmount={Number(ad.paymentAmount)}
        />

        {ad.submittedFiles.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Your Files</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {ad.submittedFiles.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <ExternalLink className="h-4 w-4" /> File {i + 1}
                </a>
              ))}
            </CardContent>
          </Card>
        )}

        {ad.adMessage && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Ad Message</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{ad.adMessage}</p>
            </CardContent>
          </Card>
        )}

        {ad.finalDesignUrl && (
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-green-700">Final Design Ready</CardTitle></CardHeader>
            <CardContent>
              <a href={ad.finalDesignUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-green-700 hover:underline">
                <Download className="h-4 w-4" /> Download your final designed ad
              </a>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
