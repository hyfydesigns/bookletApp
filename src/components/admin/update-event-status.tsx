"use client";

import { useState } from "react";
import { updateEvent } from "@/actions/events";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

const statuses = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "archived", label: "Archived" },
];

export function UpdateEventStatusSelect({
  eventId,
  currentStatus,
}: {
  eventId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onChange = async (status: string) => {
    setLoading(true);
    await updateEvent(eventId, { status: status as "draft" | "active" | "in_progress" | "completed" | "archived" });
    router.refresh();
    setLoading(false);
  };

  return (
    <Select defaultValue={currentStatus} onValueChange={onChange} disabled={loading}>
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((s) => (
          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
