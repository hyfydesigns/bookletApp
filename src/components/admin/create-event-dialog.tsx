"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createEvent } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z.object({
  organizationId: z.string().min(1, "Organization is required"),
  name: z.string().min(1, "Event name is required"),
  eventDate: z.string().optional(),
  location: z.string().optional(),
  theme: z.string().optional(),
  totalPages: z.coerce.number().min(4, "Minimum 4 pages").default(20),
  frontSectionPages: z.coerce.number().min(0).default(4),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.totalPages % 4 !== 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["totalPages"], message: "Total pages must be divisible by 4" });
  }
});

interface CreateEventDialogProps {
  organizations: { id: string; name: string }[];
  defaultOrgId?: string;
}

export function CreateEventDialog({ organizations, defaultOrgId }: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      organizationId: defaultOrgId ?? "",
      totalPages: 20,
      frontSectionPages: 4,
    },
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    try {
      await createEvent({ ...data, status: "draft" });
      reset();
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
          New Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!defaultOrgId && (
            <div className="space-y-2">
              <Label>Organization *</Label>
              <Select onValueChange={(v) => setValue("organizationId", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organizationId && <p className="text-sm text-destructive">{errors.organizationId.message}</p>}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input id="name" {...register("name")} placeholder="e.g. Annual Gala 2025" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date</Label>
              <Input id="eventDate" type="date" {...register("eventDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Input id="theme" {...register("theme")} placeholder="Gala theme..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} placeholder="Venue name, address..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="totalPages">Total Booklet Pages</Label>
              <Input id="totalPages" type="number" step={4} min={4} {...register("totalPages")} />
              {errors.totalPages && <p className="text-sm text-destructive">{errors.totalPages.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="frontSectionPages">Front Section Pages</Label>
              <Input id="frontSectionPages" type="number" min={0} {...register("frontSectionPages")} />
              {errors.frontSectionPages && <p className="text-sm text-destructive">{errors.frontSectionPages.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={3} placeholder="Event notes..." />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
