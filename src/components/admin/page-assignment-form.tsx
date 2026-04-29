"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAdPageAssignment } from "@/actions/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen } from "lucide-react";

interface PageAssignmentFormProps {
  ad: {
    id: string;
    pageNumber: number | null;
    pageSlot: string | null;
    adType: string;
  };
  eventId: string;
}

export function PageAssignmentForm({ ad, eventId }: PageAssignmentFormProps) {
  const router = useRouter();
  const [pageNumber, setPageNumber] = useState(ad.pageNumber ? String(ad.pageNumber) : "");
  const [pageSlot, setPageSlot] = useState(ad.pageSlot ?? (ad.adType === "full_page" ? "full" : "top"));
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    setLoading(true);
    await updateAdPageAssignment(ad.id, {
      pageNumber: pageNumber ? parseInt(pageNumber) : null,
      pageSlot: pageSlot as "full" | "top" | "bottom" | null,
      sharedPageWithAdId: null,
    });
    router.refresh();
    setLoading(false);
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Page Number</Label>
            <Input
              type="number"
              value={pageNumber}
              onChange={(e) => setPageNumber(e.target.value)}
              placeholder="e.g. 7"
              min={1}
            />
          </div>
          {ad.adType === "half_page" && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Position</Label>
              <Select value={pageSlot} onValueChange={setPageSlot}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top Half</SelectItem>
                  <SelectItem value="bottom">Bottom Half</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {ad.pageNumber && (
          <p className="text-xs text-muted-foreground">
            Currently: Page {ad.pageNumber}
            {ad.adType === "half_page" ? ` (${ad.pageSlot === "top" ? "Top" : "Bottom"} half)` : ""}
          </p>
        )}
        <Button size="sm" variant="outline" onClick={onSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Assign Page"}
        </Button>
      </CardContent>
    </Card>
  );
}
