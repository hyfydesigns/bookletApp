"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reorderFrontSection, addFrontSectionItem, deleteFrontSectionItem } from "@/actions/front-section";
import { FrontSectionCard } from "@/components/admin/front-section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface SectionItem {
  type: string;         // contentType key
  label: string;        // display label
  description: string;
  defaultTitle: string;
  isCustom: boolean;    // true = created by admin and exists in DB
  content: {
    id: string;
    title: string;
    bodyText: string | null;
    fileUrls: string[];
    status: string;
    pageNumber: number | null;
    adminNotes: string | null;
  } | null;
}

interface FrontSectionOrderableListProps {
  eventId: string;
  totalFrontPages: number;
  items: SectionItem[];
}

export function FrontSectionOrderableList({
  eventId,
  totalFrontPages,
  items: initialItems,
}: FrontSectionOrderableListProps) {
  const [items, setItems] = useState<SectionItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [addLabel, setAddLabel] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<SectionItem | null>(null);
  const router = useRouter();

  const move = (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);

    startTransition(async () => {
      await reorderFrontSection(eventId, newItems.map((i) => i.type));
      router.refresh();
    });
  };

  const handleAdd = async () => {
    const label = addLabel.trim() || "New Section";
    setAddLabel("");
    setShowAddInput(false);

    startTransition(async () => {
      await addFrontSectionItem(eventId, label);
      router.refresh();
    });
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete?.content) return;
    const item = confirmDelete;
    setConfirmDelete(null);
    startTransition(async () => {
      await deleteFrontSectionItem(item.content!.id);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={item.type} className="flex gap-2 items-start">
          {/* Position + move controls */}
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
              disabled={index === items.length - 1 || isPending}
              title="Move down"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Card */}
          <div className="flex-1">
            <FrontSectionCard
              eventId={eventId}
              contentType={item.type}
              label={item.label}
              description={item.description}
              defaultTitle={item.defaultTitle}
              content={item.content}
              totalFrontPages={totalFrontPages}
              isCustom={item.isCustom}
            />
          </div>

          {/* Delete button for custom sections */}
          {item.isCustom && item.content && (
            <div className="pt-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                disabled={isPending}
                title="Remove section"
                onClick={() => setConfirmDelete(item)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      ))}

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove section?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete &quot;{confirmDelete?.label}&quot; and all its content. This cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDeleteConfirmed}
              disabled={isPending}
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Section */}
      <div className="pl-10 pt-1">
        {showAddInput ? (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              value={addLabel}
              onChange={(e) => setAddLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") { setShowAddInput(false); setAddLabel(""); }
              }}
              placeholder="Section name…"
              className="h-8 text-sm max-w-[220px]"
            />
            <Button size="sm" onClick={handleAdd} disabled={isPending}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowAddInput(false); setAddLabel(""); }}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setShowAddInput(true)}
            disabled={isPending}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Section
          </Button>
        )}
      </div>
    </div>
  );
}
