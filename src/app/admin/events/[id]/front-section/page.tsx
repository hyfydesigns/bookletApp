import { getEvent } from "@/actions/events";
import { getFrontSectionContents } from "@/actions/front-section";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FrontSectionCard } from "@/components/admin/front-section-card";

const CONTENT_TYPES = [
  { type: "president_photo", label: "Cover Page", description: "Booklet cover with photo", defaultTitle: "Cover Page" },
  { type: "welcome_address", label: "Welcome Address", description: "President's welcome message", defaultTitle: "" },
  { type: "executives_list", label: "Executives / Board", description: "Board members and executives", defaultTitle: "" },
  { type: "committee_members", label: "Planning Committee", description: "Event planning committee members", defaultTitle: "" },
  { type: "sponsors_list", label: "Sponsors List", description: "Event sponsors and supporters", defaultTitle: "" },
  { type: "event_details", label: "Event Details", description: "Program, agenda, or event info", defaultTitle: "" },
  { type: "other", label: "Other Content", description: "Additional front section content", defaultTitle: "" },
];

export default async function FrontSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, contents] = await Promise.all([
    getEvent(id),
    getFrontSectionContents(id),
  ]);
  if (!event) notFound();

  const contentMap = Object.fromEntries(contents.map((c) => [c.contentType, c]));
  const doneCount = contents.filter((c) => c.status === "done").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/events/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Front Section</h2>
          <p className="text-muted-foreground">{event.name} · {doneCount}/{CONTENT_TYPES.length} complete</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONTENT_TYPES.map(({ type, label, description, defaultTitle }) => {
          const content = contentMap[type as keyof typeof contentMap];
          return (
            <FrontSectionCard
              key={type}
              eventId={id}
              contentType={type}
              label={label}
              description={description}
              defaultTitle={defaultTitle}
              content={content ?? null}
            />
          );
        })}
      </div>
    </div>
  );
}
