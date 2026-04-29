import { getAd, getAds } from "@/actions/ads";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdStatusBadge, PaymentBadge } from "@/components/shared/status-badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Mail, Phone, User, FileText, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdStatusManager } from "@/components/admin/ad-status-manager";
import { PageAssignmentForm } from "@/components/admin/page-assignment-form";
import { EditAdDialog } from "@/components/admin/edit-ad-dialog";
import { DeleteAdButton } from "@/components/admin/delete-ad-button";

export default async function AdDetailPage({
  params,
}: {
  params: Promise<{ id: string; adId: string }>;
}) {
  const { id, adId } = await params;
  const [ad, eventAds] = await Promise.all([getAd(adId), getAds(id)]);
  if (!ad) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/events/${id}/ads`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{ad.adCode}</span>
            <h2 className="text-2xl font-bold">{ad.advertiserName}</h2>
          </div>
          <p className="text-muted-foreground">
            {ad.adType === "full_page" ? "Full Page" : "Half Page"} · {ad.event.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EditAdDialog ad={{ id: ad.id, advertiserName: ad.advertiserName, contactPerson: ad.contactPerson, contactEmail: ad.contactEmail, contactPhone: ad.contactPhone, adMessage: ad.adMessage, notes: ad.notes, submittedFiles: ad.submittedFiles }} />
          <AdStatusBadge status={ad.adContentStatus} />
          <PaymentBadge status={ad.paymentStatus} />
          <DeleteAdButton
            id={ad.id}
            adCode={ad.adCode}
            advertiserName={ad.advertiserName}
            redirectTo={`/admin/events/${id}/ads`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Advertiser Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {ad.contactPerson && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {ad.contactPerson}
                </div>
              )}
              {ad.contactEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${ad.contactEmail}`} className="text-blue-600 hover:underline">
                    {ad.contactEmail}
                  </a>
                </div>
              )}
              {ad.contactPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {ad.contactPhone}
                </div>
              )}
              <div className="pt-2 border-t">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ad Type</span>
                  <span className="font-medium capitalize">{ad.adType.replace("_", " ")}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">{formatCurrency(Number(ad.paymentAmount))}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-semibold text-green-600">{formatCurrency(Number(ad.amountPaid))}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Submitted {formatDate(ad.createdAt)}
                {ad.submittedBy && ` by ${ad.submittedBy.name}`}
              </p>
            </CardContent>
          </Card>

          {ad.adMessage && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Ad Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{ad.adMessage}</p>
              </CardContent>
            </Card>
          )}

          {ad.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{ad.notes}</p>
              </CardContent>
            </Card>
          )}

          {ad.submittedFiles.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Submitted Files ({ad.submittedFiles.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ad.submittedFiles.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    File {i + 1}
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <AdStatusManager ad={{ id: ad.id, adContentStatus: ad.adContentStatus, paymentStatus: ad.paymentStatus, amountPaid: Number(ad.amountPaid), paymentAmount: Number(ad.paymentAmount), finalDesignUrl: ad.finalDesignUrl }} eventId={id} />
          <PageAssignmentForm
            ad={{ id: ad.id, pageNumber: ad.pageNumber, pageSlot: ad.pageSlot, adType: ad.adType, sharedPageWithAdId: ad.sharedPageWithAdId }}
            eventAds={eventAds.map(a => ({ id: a.id, adCode: a.adCode, advertiserName: a.advertiserName, adType: a.adType, pageNumber: a.pageNumber, pageSlot: a.pageSlot }))}
            eventId={id}
            totalPages={ad.event.totalPages}
          />

          {ad.finalDesignUrl && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Final Design</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={ad.finalDesignUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <Download className="h-4 w-4" />
                  Download final design
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
