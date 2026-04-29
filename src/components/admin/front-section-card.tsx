"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { upsertFrontSectionContent, updateContentStatus } from "@/actions/front-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ContentStatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Eye, FileText, ExternalLink, Image, Users, List, Star, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  president_photo: Image,
  welcome_address: FileText,
  executives_list: Users,
  committee_members: List,
  sponsors_list: Star,
  event_details: Info,
  other: FileText,
};

interface FrontSectionCardProps {
  eventId: string;
  contentType: string;
  label: string;
  description: string;
  content: {
    id: string;
    title: string;
    bodyText: string | null;
    fileUrls: string[];
    status: string;
    adminNotes: string | null;
  } | null;
}

export function FrontSectionCard({
  eventId,
  contentType,
  label,
  description,
  content,
}: FrontSectionCardProps) {
  const Icon = ICON_MAP[contentType] ?? FileText;
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: content?.title ?? label,
      bodyText: content?.bodyText ?? "",
      adminNotes: content?.adminNotes ?? "",
    },
  });

  const onSubmit = async (data: { title: string; bodyText: string; adminNotes: string }) => {
    setLoading(true);
    try {
      await upsertFrontSectionContent({
        eventId,
        contentType: contentType as "president_photo" | "welcome_address" | "executives_list" | "committee_members" | "sponsors_list" | "event_details" | "other",
        title: data.title,
        bodyText: data.bodyText,
        fileUrls: content?.fileUrls ?? [],
        adminNotes: data.adminNotes,
      });
      setEditOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const onStatusChange = async (status: string) => {
    if (!content) return;
    await updateContentStatus(content.id, status as "pending" | "submitted" | "in_progress" | "done");
    router.refresh();
  };

  return (
    <Card className={content?.status === "done" ? "border-green-200 bg-green-50/30" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          {content && <ContentStatusBadge status={content.status} />}
          {!content && <ContentStatusBadge status="pending" />}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {content ? (
          <>
            {content.bodyText && (
              <p className="text-sm text-muted-foreground line-clamp-2">{content.bodyText}</p>
            )}
            {content.fileUrls.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {content.fileUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> File {i + 1}
                  </a>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Select defaultValue={content.status} onValueChange={onStatusChange}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit: {label}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Content / Notes</Label>
                      <Textarea {...register("bodyText")} rows={5} placeholder="Enter content here..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Admin Notes</Label>
                      <Textarea {...register("adminNotes")} rows={2} placeholder="Internal notes..." />
                    </div>
                    <div className="flex gap-3">
                      <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="flex-1">Cancel</Button>
                      <Button type="submit" disabled={loading} className="flex-1">{loading ? "Saving..." : "Save"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-3">
            <p className="text-xs text-muted-foreground">No content submitted yet</p>
          </div>
        )}

        {!content && (
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <FileText className="h-3.5 w-3.5 mr-1" /> Add Content
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add: {label}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Content / Notes</Label>
                  <Textarea {...register("bodyText")} rows={5} placeholder="Enter content here..." />
                </div>
                <div className="space-y-2">
                  <Label>Admin Notes</Label>
                  <Textarea {...register("adminNotes")} rows={2} placeholder="Internal notes..." />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" disabled={loading} className="flex-1">{loading ? "Saving..." : "Save"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
