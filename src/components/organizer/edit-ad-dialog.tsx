"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateAd } from "@/actions/ads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing";
import { Pencil, X, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z.object({
  advertiserName: z.string().min(1, "Advertiser name is required"),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  adMessage: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface OrganizerEditAdDialogProps {
  ad: {
    id: string;
    advertiserName: string;
    contactPerson: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    adMessage: string | null;
    notes: string | null;
    submittedFiles: string[];
    adContentStatus: string;
  };
}

export function OrganizerEditAdDialog({ ad }: OrganizerEditAdDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<string[]>(ad.submittedFiles);
  const router = useRouter();

  const canEdit = ad.adContentStatus === "pending";

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      advertiserName: ad.advertiserName,
      contactPerson: ad.contactPerson ?? "",
      contactEmail: ad.contactEmail ?? "",
      contactPhone: ad.contactPhone ?? "",
      adMessage: ad.adMessage ?? "",
      notes: ad.notes ?? "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      await updateAd(ad.id, { ...data, submittedFiles: files });
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (!canEdit) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Pencil className="h-4 w-4" />
          Edit Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Advertiser / Business Name *</Label>
            <Input {...register("advertiserName")} />
            {errors.advertiserName && <p className="text-sm text-destructive">{errors.advertiserName.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input {...register("contactPerson")} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register("contactPhone")} placeholder="(555) 000-0000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register("contactEmail")} placeholder="advertiser@email.com" />
            {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Ad Message / Text</Label>
            <Textarea {...register("adMessage")} rows={4} placeholder="Ad content, tagline, contact info..." />
          </div>
          <div className="space-y-2">
            <Label>Special Instructions</Label>
            <Textarea {...register("notes")} rows={2} placeholder="Colors, font preferences, layout notes..." />
          </div>
          <div className="space-y-2">
            <Label>Files</Label>
            <UploadButton
              endpoint="adFiles"
              onClientUploadComplete={(res) => {
                if (res) setFiles((prev) => [...prev, ...res.map((r) => r.url)]);
              }}
              onUploadError={(err) => alert(`Upload error: ${err.message}`)}
            />
            {files.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {files.map((url, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                    <FileText className="h-3 w-3" />
                    File {i + 1}
                    <button type="button" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
