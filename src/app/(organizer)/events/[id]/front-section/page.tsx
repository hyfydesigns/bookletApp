import { getEvent } from "@/actions/events";
import { getFrontSectionContents } from "@/actions/front-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentStatusBadge } from "@/components/shared/status-badge";
import { ArrowLeft, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrganizerFrontSectionForm } from "@/components/organizer/front-section-form";

const CONTENT_TYPES = [
  { type: "president_photo", label: "President's Photo" },
  { type: "welcome_address", label: "Welcome Address" },
  { type: "executives_list", label: "Executives / Board Members" },
  { type: "committee_members", label: "Planning Committee" },
  { type: "sponsors_list", label: "Sponsors List" },
  { type: "event_details", label: "Event Details / Program" },
];

export default async function OrgFrontSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, contents] = await Promise.all([getEvent(id), getFrontSectionContents(id)]);
  if (!event) notFound();

  const contentMap = Object.fromEntries(contents.map((c) => [c.contentType, c]));
  const doneCount = contents.filter((c) => c.status === "done").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/events/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Front Section</h2>
          <p className="text-muted-foreground">{event.name} · {doneCount} complete</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-3">
        Submit content for your booklet's front pages. The designer will use this to create each section.
        Upload photos/files or write the content in the text fields.
      </p>

      <div className="space-y-4">
        {CONTENT_TYPES.map(({ type, label }) => {
          const content = contentMap[type];
          return (
            <OrganizerFrontSectionForm
              key={type}
              eventId={id}
              contentType={type}
              label={label}
              content={content ?? null}
            />
          );
        })}
      </div>
    </div>
  );
}
