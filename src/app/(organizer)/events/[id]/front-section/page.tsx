import { getEvent } from "@/actions/events";
import { getFrontSectionContents } from "@/actions/front-section";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrganizerFrontSectionForm } from "@/components/organizer/front-section-form";

const DEFAULT_CONTENT_TYPES = [
  { type: "president_photo", label: "Cover Page", defaultTitle: "Cover Page" },
  { type: "welcome_address", label: "Welcome Address", defaultTitle: "" },
  { type: "executives_list", label: "Executives / Board Members", defaultTitle: "" },
  { type: "committee_members", label: "Planning Committee", defaultTitle: "" },
  { type: "sponsors_list", label: "Sponsors List", defaultTitle: "" },
  { type: "event_details", label: "Event Details / Program", defaultTitle: "" },
];

function applyOrder(contentTypes: typeof DEFAULT_CONTENT_TYPES, savedOrder: string[]) {
  if (!savedOrder.length) return contentTypes;
  const map = Object.fromEntries(contentTypes.map((ct) => [ct.type, ct]));
  const ordered = savedOrder.map((type) => map[type]).filter(Boolean) as typeof DEFAULT_CONTENT_TYPES;
  for (const ct of contentTypes) {
    if (!savedOrder.includes(ct.type)) ordered.push(ct);
  }
  return ordered;
}

export default async function OrgFrontSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, contents] = await Promise.all([getEvent(id), getFrontSectionContents(id)]);
  if (!event) notFound();

  const contentMap = Object.fromEntries(contents.map((c) => [c.contentType, c]));
  const doneCount = contents.filter((c) => c.status === "done").length;
  const orderedTypes = applyOrder(DEFAULT_CONTENT_TYPES, event.frontSectionOrder ?? []);

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
        Submit content for your booklet's front pages. Give each page a title, add your content, and upload any images or files. The designer will use this to create each section.
      </p>

      <div className="space-y-4">
        {orderedTypes.map(({ type, label, defaultTitle }, index) => {
          const content = contentMap[type];
          return (
            <div key={type} className="flex items-start gap-3">
              <div className="pt-4 min-w-[24px] text-center">
                <span className="text-xs font-semibold text-muted-foreground">{index + 1}</span>
                {content?.pageNumber != null && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">Pg {content.pageNumber}</p>
                )}
              </div>
              <div className="flex-1">
                <OrganizerFrontSectionForm
                  key={type}
                  eventId={id}
                  contentType={type}
                  label={label}
                  defaultTitle={defaultTitle}
                  content={content ?? null}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
