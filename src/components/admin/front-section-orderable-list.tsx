"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reorderFrontSection } from "@/actions/front-section";
import { FrontSectionCard } from "@/components/admin/front-section-card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ContentTypeConfig {
  type: string;
  label: string;
  description: string;
  defaultTitle: string;
}

interface ContentRecord {
  id: string;
  contentType: string;
  title: string;
  bodyText: string | null;
  fileUrls: string[];
  status: string;
  pageNumber: number | null;
  adminNotes: string | null;
}

interface FrontSectionOrderableListProps {
  eventId: string;
  totalFrontPages: number;
  contentTypes: ContentTypeConfig[];
  contentMap: Record<string, ContentRecord>;
  savedOrder: string[];
}

function applyOrder(contentTypes: ContentTypeConfig[], savedOrder: string[]): ContentTypeConfig[] {
  if (!savedOrder.length) return contentTypes;
  const map = Object.fromEntries(contentTypes.map((ct) => [ct.type, ct]));
  const ordered: ContentTypeConfig[] = [];
  for (const type of savedOrder) {
    if (map[type]) ordered.push(map[type]);
  }
  // Append any types not in savedOrder (newly added types)
  for (const ct of contentTypes) {
    if (!savedOrder.includes(ct.type)) ordered.push(ct);
  }
  return ordered;
}

export function FrontSectionOrderableList({
  eventId,
  totalFrontPages,
  contentTypes,
  contentMap,
  savedOrder,
}: FrontSectionOrderableListProps) {
  const [order, setOrder] = useState<ContentTypeConfig[]>(() =>
    applyOrder(contentTypes, savedOrder)
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const move = (index: number, direction: "up" | "down") => {
    const newOrder = [...order];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setOrder(newOrder);

    startTransition(async () => {
      await reorderFrontSection(eventId, newOrder.map((ct) => ct.type));
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      {order.map((ct, index) => {
        const content = contentMap[ct.type] ?? null;
        return (
          <div key={ct.type} className="flex gap-2 items-start">
            {/* Position number + move controls */}
            <div className="flex flex-col items-center gap-0.5 pt-3 min-w-[36px]">
              <span className="text-xs font-semibold text-muted-foreground tabular-nums leading-none mb-1">
                {index + 1}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => move(index, "up")}
                disabled={index === 0 || isPending}
                title="Move up"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => move(index, "down")}
                disabled={index === order.length - 1 || isPending}
                title="Move down"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Card */}
            <div className="flex-1">
              <FrontSectionCard
                eventId={eventId}
                contentType={ct.type}
                label={ct.label}
                description={ct.description}
                defaultTitle={ct.defaultTitle}
                content={content}
                totalFrontPages={totalFrontPages}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
