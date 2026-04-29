"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateEvent } from "@/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";

const baseSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  eventDate: z.string().optional(),
  location: z.string().optional(),
  theme: z.string().optional(),
  totalPages: z.coerce.number().min(4, "Minimum 4 pages"),
  frontSectionPages: z.coerce.number().min(0),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof baseSchema>;

const schema = baseSchema.superRefine((data, ctx) => {
  if (data.totalPages % 4 !== 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["totalPages"], message: "Total pages must be divisible by 4" });
  }
  if (data.frontSectionPages % 4 !== 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["frontSectionPages"], message: "Front section pages must be divisible by 4" });
  }
});

interface EditEventDialogProps {
  event: {
    id: string;
    name: string;
    eventDate: Date | null;
    location: string | null;
    theme: string | null;
    totalPages: number;
    frontSectionPages: number;
    notes: string | null;
  };
}

export function EditEventDialog({ event }: EditEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: event.name,
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split("T")[0] : "",
      location: event.location ?? "",
      theme: event.theme ?? "",
      totalPages: event.totalPages,
      frontSectionPages: event.frontSectionPages,
      notes: event.notes ?? "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      await updateEvent(event.id, data);
      setOpen(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Pencil className="h-4 w-4" />
          Edit Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name *</Label>
            <Input id="name" {...register("name")} />
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
              <Input id="frontSectionPages" type="number" step={4} min={0} {...register("frontSectionPages")} />
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
