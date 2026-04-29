"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { upsertFrontSectionContent } from "@/actions/front-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ContentStatusBadge } from "@/components/shared/status-badge";
import { UploadButton } from "@/lib/uploadthing";
import { CheckCircle, ChevronDown, ChevronUp, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrganizerFrontSectionFormProps {
  eventId: string;
  contentType: string;
  label: string;
  content: {
    id: string;
    bodyText: string | null;
    fileUrls: string[];
    status: string;
  } | null;
}

export function OrganizerFrontSectionForm({
  eventId,
  contentType,
  label,
  content,
}: OrganizerFrontSectionFormProps) {
  const [expanded, setExpanded] = useState(!content || content.status === "pending");
  const [loading, setLoading] = useState(false);
  const [fileUrls, setFileUrls] = useState<string[]>(content?.fileUrls ?? []);
  const router = useRouter();

  const { register, handleSubmit } = useForm({
    defaultValues: { bodyText: content?.bodyText ?? "" },
  });

  const onSubmit = async (data: { bodyText: string }) => {
    setLoading(true);
    try {
      await upsertFrontSectionContent({
        eventId,
        contentType: contentType as "president_photo" | "welcome_address" | "executives_list" | "committee_members" | "sponsors_list" | "event_details" | "other",
        title: label,
        bodyText: data.bodyText,
        fileUrls,
      });
      router.refresh();
      setExpanded(false);
    } finally {
      setLoading(false);
    }
  };

  const isDone = content?.status === "done";

  return (
    <Card className={isDone ? "border-green-200 bg-green-50/30" : ""}>
      <CardHeader className="pb-3">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center gap-3">
            {isDone ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/40" />
            )}
            <div>
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              {content && !isDone && (
                <ContentStatusBadge status={content.status} />
              )}
              {isDone && <p className="text-xs text-green-600">Completed by designer</p>}
            </div>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </CardHeader>

      {expanded && !isDone && (
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                {...register("bodyText")}
                rows={4}
                placeholder={`Enter ${label.toLowerCase()} content here...`}
              />
            </div>
            <div className="space-y-2">
              <Label>Upload Files (photos, documents)</Label>
              <UploadButton
                endpoint="frontSectionFiles"
                onClientUploadComplete={(res) => {
                  if (res) setFileUrls((prev) => [...prev, ...res.map((r) => r.url)]);
                }}
                onUploadError={(err) => alert(`Upload error: ${err.message}`)}
              />
              {fileUrls.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {fileUrls.map((url, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                      <FileText className="h-3 w-3" />
                      File {i + 1}
                      <button type="button" onClick={() => setFileUrls((p) => p.filter((_, j) => j !== i))}>
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" disabled={loading} size="sm">
              {loading ? "Submitting..." : content ? "Update" : "Submit"}
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  );
}
