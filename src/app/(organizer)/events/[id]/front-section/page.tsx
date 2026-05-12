import { getEvent } from "@/actions/events";
import { getFrontSectionContents } from "@/actions/front-section";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrganizerFrontSectionForm } from "@/components/organizer/front-section-form";

const PREDEFINED = [
  { type: "president_photo",  label: "Cover Page",                 defaultTitle: "Cover Page" },
  { type: "welcome_address",  label: "Welcome Address",            defaultTitle: "" },
  { type: "executives_list",  label: "Executives / Board Members", defaultTitle: "" },
  { type: "committee_members",label: "Planning Committee",         defaultTitle: "" },
  { type: "sponsors_list",    label: "Sponsors List",              defaultTitle: "" },
  { type: "event_details",    label: "Event Details / Program",    defaultTitle: "" },
  { type: "other",            label: "Other Content",              defaultTitle: "" },
];
const PREDEFINED_TYPES = new Set(PREDEFINED.map((p) => p.type));

export default async function OrgFrontSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, contents] = await Promise.all([getEvent(id), getFrontSectionContents(id)]);
  if (!event) notFound();

  const contentMap = Object.fromEntries(contents.map((c) => [c.contentType, c]));
  const savedOrder: string[] = event.frontSectionOrder ?? [];
  const doneCount = contents.filter((c) => c.status === "done").length;

  // Build ordered list: predefined + custom DB sections
  const allTypes = [
    ...PREDEFINED,
    ...contents
      .filter((c) => !PREDEFINED_TYPES.has(c.contentType))
      .map((c) => ({ type: c.contentType, label: c.title || "Custom Section", defaultTitle: "" })),
  ];

  const ordered = savedOrder.length
    ? [
        ...savedOrder.map((t) => allTypes.find((a) => a.type === t)).filter(Boolean) as typeof allTypes,
        ...allTypes.filter((a) => !savedOrder.includes(a.type)),
      ]
    : allTypes;

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
        {ordered.map(({ type, label, defaultTitle }, index) => {
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
