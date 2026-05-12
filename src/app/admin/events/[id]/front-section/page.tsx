import { getEvent } from "@/actions/events";
import { getFrontSectionContents } from "@/actions/front-section";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FrontSectionOrderableList, type SectionItem } from "@/components/admin/front-section-orderable-list";

const PREDEFINED = [
  { type: "president_photo",  label: "Cover Page",        description: "Booklet cover with photo",             defaultTitle: "Cover Page" },
  { type: "welcome_address",  label: "Welcome Address",   description: "President's welcome message",          defaultTitle: "" },
  { type: "executives_list",  label: "Executives / Board",description: "Board members and executives",         defaultTitle: "" },
  { type: "committee_members",label: "Planning Committee",description: "Event planning committee members",     defaultTitle: "" },
  { type: "sponsors_list",    label: "Sponsors List",     description: "Event sponsors and supporters",        defaultTitle: "" },
  { type: "event_details",    label: "Event Details",     description: "Program, agenda, or event info",       defaultTitle: "" },
  { type: "other",            label: "Other Content",     description: "Additional front section content",     defaultTitle: "" },
];

const PREDEFINED_TYPES = new Set(PREDEFINED.map((p) => p.type));

export default async function FrontSectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [event, contents] = await Promise.all([getEvent(id), getFrontSectionContents(id)]);
  if (!event) notFound();

  const contentMap = Object.fromEntries(contents.map((c) => [c.contentType, c]));
  const savedOrder: string[] = event.frontSectionOrder ?? [];

  // Build predefined items
  const predefinedItems: SectionItem[] = PREDEFINED.map((p) => ({
    type: p.type,
    label: p.label,
    description: p.description,
    defaultTitle: p.defaultTitle,
    isCustom: false,
    content: contentMap[p.type] ?? null,
  }));

  // Build custom items (DB records whose contentType isn't a predefined type)
  const customItems: SectionItem[] = contents
    .filter((c) => !PREDEFINED_TYPES.has(c.contentType))
    .map((c) => ({
      type: c.contentType,
      label: c.title || "Custom Section",
      description: "Custom section",
      defaultTitle: "",
      isCustom: true,
      content: c,
    }));

  const allItems = [...predefinedItems, ...customItems];

  // Apply saved order
  function applyOrder(items: SectionItem[], order: string[]): SectionItem[] {
    if (!order.length) return items;
    const map = Object.fromEntries(items.map((i) => [i.type, i]));
    const ordered: SectionItem[] = [];
    for (const type of order) {
      if (map[type]) ordered.push(map[type]);
    }
    for (const item of items) {
      if (!order.includes(item.type)) ordered.push(item);
    }
    return ordered;
  }

  const orderedItems = applyOrder(allItems, savedOrder);
  const doneCount = contents.filter((c) => c.status === "done").length;
  const totalSections = orderedItems.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/events/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">Front Section</h2>
          <p className="text-muted-foreground">
            {event.name} · {doneCount}/{totalSections} complete · {event.frontSectionPages} page{event.frontSectionPages !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Use ↑↓ to reorder. Click <strong>Add Section</strong> to add more pages. Set a page number on each card once content exists.
      </p>

      <FrontSectionOrderableList
        eventId={id}
        totalFrontPages={event.frontSectionPages}
        items={orderedItems}
      />
    </div>
  );
}
