import { getEvent } from "@/actions/events";
import { getFrontSectionContents } from "@/actions/front-section";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FrontSectionOrderableList } from "@/components/admin/front-section-orderable-list";

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
          <p className="text-muted-foreground">
            {event.name} · {doneCount}/{CONTENT_TYPES.length} complete · {event.frontSectionPages} page{event.frontSectionPages !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Use the arrows to reorder sections. Set a page number on each card once content is submitted.
      </p>

      <FrontSectionOrderableList
        eventId={id}
        totalFrontPages={event.frontSectionPages}
        contentTypes={CONTENT_TYPES}
        contentMap={contentMap}
        savedOrder={event.frontSectionOrder ?? []}
      />
    </div>
  );
}
