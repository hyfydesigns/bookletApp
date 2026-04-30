"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { upsertFrontSectionContent } from "@/actions/front-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ContentStatusBadge } from "@/components/shared/status-badge";
import { UploadButton } from "@/lib/uploadthing";
import { CheckCircle, ChevronDown, ChevronUp, FileText, Image, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrganizerFrontSectionFormProps {
  eventId: string;
  contentType: string;
  label: string;
  defaultTitle: string;
  content: {
    id: string;
    title: string;
    bodyText: string | null;
    fileUrls: string[];
    status: string;
  } | null;
}

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
}

export function OrganizerFrontSectionForm({
  eventId,
  contentType,
  label,
  defaultTitle,
  content,
}: OrganizerFrontSectionFormProps) {
  const [expanded, setExpanded] = useState(!content || content.status === "pending");
  const [loading, setLoading] = useState(false);
  const [fileUrls, setFileUrls] = useState<{ url: string; name: string }[]>(
    (content?.fileUrls ?? []).map((url, i) => ({ url, name: `File ${i + 1}` }))
  );
  const router = useRouter();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      title: content?.title ?? defaultTitle,
      bodyText: content?.bodyText ?? "",
    },
  });

  const onSubmit = async (data: { title: string; bodyText: string }) => {
    setLoading(true);
    try {
      await upsertFrontSectionContent({
        eventId,
        contentType: contentType as "president_photo" | "welcome_address" | "executives_list" | "committee_members" | "sponsors_list" | "event_details" | "other",
        title: data.title,
        bodyText: data.bodyText,
        fileUrls: fileUrls.map((f) => f.url),
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
              <CardTitle className="text-sm font-medium">
                {content?.title || <span className="text-muted-foreground font-normal italic">{label}</span>}
              </CardTitle>
              {content && !isDone && <ContentStatusBadge status={content.status} />}
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
              <Label>Page Title</Label>
              <Input
                {...register("title")}
                placeholder="Enter a title for this page..."
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                {...register("bodyText")}
                rows={4}
                placeholder={`Enter ${label.toLowerCase()} content here...`}
              />
            </div>
            <div className="space-y-2">
              <Label>Upload Images / Files</Label>
              <UploadButton
                endpoint="frontSectionFiles"
                onClientUploadComplete={(res) => {
                  if (res) setFileUrls((prev) => [...prev, ...res.map((r) => ({ url: r.url, name: r.name }))]);
                }}
                onUploadError={(err) => alert(`Upload error: ${err.message}`)}
              />
              {fileUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {fileUrls.map((file, i) => (
                    <div key={i} className="relative group">
                      {isImageUrl(file.url) ? (
                        <div className="relative">
                          <img
                            src={file.url}
                            alt={file.name}
                            className="h-20 w-20 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => setFileUrls((p) => p.filter((_, j) => j !== i))}
                            className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs bg-muted px-2 py-1.5 rounded border">
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="max-w-[100px] truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setFileUrls((p) => p.filter((_, j) => j !== i))}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
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
