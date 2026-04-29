"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAdPageAssignment } from "@/actions/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Users } from "lucide-react";

interface OtherAd {
  id: string;
  adCode: string;
  advertiserName: string;
  adType: string;
  pageNumber: number | null;
  pageSlot: string | null;
}

interface PageAssignmentFormProps {
  ad: {
    id: string;
    pageNumber: number | null;
    pageSlot: string | null;
    adType: string;
    sharedPageWithAdId: string | null;
  };
  eventAds: OtherAd[];
  eventId: string;
  totalPages: number;
}

export function PageAssignmentForm({ ad, eventAds, eventId, totalPages }: PageAssignmentFormProps) {
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState(ad.pageNumber ? String(ad.pageNumber) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pageNum = parseInt(pageNumber);

  // Client-side conflict preview (excluding this ad)
  const adsOnEnteredPage = pageNum
    ? eventAds.filter((a) => a.id !== ad.id && a.pageNumber === pageNum)
    : [];

  const potentialPartner =
    ad.adType === "half_page" && pageNum
      ? adsOnEnteredPage.find((a) => a.adType === "half_page")
      : null;

  const fullPageConflict =
    pageNum ? adsOnEnteredPage.find((a) => a.adType === "full_page") : null;

  const halfPagesFull =
    ad.adType === "half_page" && pageNum
      ? adsOnEnteredPage.filter((a) => a.adType === "half_page").length >= 2
      : false;

  const fullPageOccupied =
    ad.adType === "full_page" && adsOnEnteredPage.length > 0;

  const clientError =
    pageNum && pageNum > totalPages
      ? `Page ${pageNum} exceeds the event total of ${totalPages} pages`
      : fullPageConflict
      ? `Page ${pageNum} already has a full-page ad`
      : halfPagesFull
      ? `Page ${pageNum} already has two half-page ads`
      : fullPageOccupied
      ? `Page ${pageNum} is already occupied by another ad`
      : null;

  // Current partner (already shared)
  const currentPartner = ad.sharedPageWithAdId
    ? eventAds.find((a) => a.id === ad.sharedPageWithAdId)
    : null;

  const onSave = async () => {
    if (clientError) return;
    setError(null);
    setLoading(true);
    try {
      await updateAdPageAssignment(ad.id, pageNum || null);
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to assign page");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Page Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            Page Number <span className="text-muted-foreground/60">(max {totalPages})</span>
          </Label>
          <Input
            type="number"
            value={pageNumber}
            onChange={(e) => { setPageNumber(e.target.value); setError(null); }}
            placeholder="e.g. 7"
            min={1}
            max={totalPages}
          />
        </div>

        {/* Validation errors */}
        {(clientError || error) && (
          <p className="text-xs text-destructive">{clientError ?? error}</p>
        )}

        {/* Current assignment */}
        {ad.pageNumber && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
            Currently: Page {ad.pageNumber}
            {ad.adType === "half_page" && (
              <span> · {ad.pageSlot === "top" ? "Top" : "Bottom"} half</span>
            )}
            {currentPartner && (
              <span className="flex items-center gap-1 mt-0.5 text-blue-600">
                <Users className="h-3 w-3" />
                Shared with {currentPartner.advertiserName} ({currentPartner.adCode})
              </span>
            )}
          </div>
        )}

        {/* Sharing preview for half-page */}
        {potentialPartner && (
          <div className="text-xs bg-blue-50 border border-blue-200 rounded px-2 py-1.5 text-blue-700">
            <div className="flex items-center gap-1 font-medium">
              <Users className="h-3 w-3" />
              Page {pageNum} already has a half-page ad
            </div>
            <p className="mt-0.5">
              <span className="font-medium">{potentialPartner.advertiserName}</span> ({potentialPartner.adCode})
              · {potentialPartner.pageSlot === "bottom" ? "Bottom" : "Top"} half
            </p>
            <p className="mt-0.5 text-blue-600">
              This ad will take the {potentialPartner.pageSlot === "bottom" ? "top" : "bottom"} half and share the page.
            </p>
          </div>
        )}

        {ad.adType === "half_page" && pageNum && !potentialPartner && !clientError && (
          <p className="text-xs text-muted-foreground">
            Half-page ad — will be assigned to the top half. A second half-page ad can share this page.
          </p>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
            disabled={loading || !!clientError}
            className="flex-1"
          >
            {loading ? "Saving..." : "Assign Page"}
          </Button>
          {ad.pageNumber && (
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                setError(null);
                setLoading(true);
                try {
                  await updateAdPageAssignment(ad.id, null);
                  setPageNumber("");
                  router.refresh();
                } catch (e: unknown) {
                  setError(e instanceof Error ? e.message : "Failed to clear page");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="text-destructive hover:text-destructive"
            >
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
