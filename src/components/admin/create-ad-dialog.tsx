"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createAd } from "@/actions/ads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UploadButton } from "@/lib/uploadthing";
import { Plus, X, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z.object({
  advertiserName: z.string().min(1, "Advertiser name is required"),
  adType: z.enum(["full_page", "half_page"]),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  adMessage: z.string().optional(),
  notes: z.string().optional(),
});

export function AdminCreateAdDialog({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const router = useRouter();

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { adType: "full_page" },
  });

  const adType = watch("adType");

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      await createAd({ ...data, eventId, submittedFiles: uploadedFiles });
      reset();
      setUploadedFiles([]);
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Ad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Ad Type *</Label>
            <Select defaultValue="full_page" onValueChange={(v) => setValue("adType", v as "full_page" | "half_page")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_page">Full Page — $100</SelectItem>
                <SelectItem value="half_page">Half Page — $50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="advertiserName">Advertiser / Business Name *</Label>
            <Input id="advertiserName" {...register("advertiserName")} placeholder="e.g. ABC Business" />
            {errors.advertiserName && <p className="text-sm text-destructive">{errors.advertiserName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input id="contactPerson" {...register("contactPerson")} placeholder="Full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input id="contactPhone" {...register("contactPhone")} placeholder="(555) 000-0000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail">Email</Label>
            <Input id="contactEmail" type="email" {...register("contactEmail")} placeholder="advertiser@email.com" />
          </div>

          <div className="space-y-2">
            <Label>Upload Files (logo, photos, pre-designed ad)</Label>
            <UploadButton
              endpoint="adFiles"
              onClientUploadComplete={(res) => {
                if (res) setUploadedFiles((prev) => [...prev, ...res.map((r) => r.url)]);
              }}
              onUploadError={(err) => alert(`Upload error: ${err.message}`)}
            />
            {uploadedFiles.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {uploadedFiles.map((url, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded">
                    <FileText className="h-3 w-3" />
                    File {i + 1}
                    <button type="button" onClick={() => setUploadedFiles((p) => p.filter((_, j) => j !== i))}>
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adMessage">Ad Message / Text</Label>
            <Textarea
              id="adMessage"
              {...register("adMessage")}
              rows={4}
              placeholder="If no pre-designed ad: enter the ad text, tagline, contact info, etc. to be designed..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions</Label>
            <Textarea id="notes" {...register("notes")} rows={2} placeholder="Colors, font preferences, layout notes..." />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : `Add ${adType === "full_page" ? "Full Page ($100)" : "Half Page ($50)"}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
