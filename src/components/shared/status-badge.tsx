import { Badge } from "@/components/ui/badge";

export function AdStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "warning" | "info" | "success" | "outline" }> = {
    pending: { label: "Pending", variant: "warning" },
    designing: { label: "Designing", variant: "info" },
    complete: { label: "Complete", variant: "success" },
  };
  const s = map[status] ?? { label: status, variant: "outline" };
  return <Badge variant={s.variant as "default"}>{s.label}</Badge>;
}

export function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "warning" | "info" | "success" | "outline" }> = {
    unpaid: { label: "Unpaid", variant: "warning" },
    partial: { label: "Partial", variant: "info" },
    received: { label: "Paid", variant: "success" },
  };
  const s = map[status] ?? { label: status, variant: "outline" };
  return <Badge variant={s.variant as "default"}>{s.label}</Badge>;
}

export function EventStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "warning" | "info" | "success" | "outline" | "secondary" }> = {
    draft: { label: "Draft", variant: "secondary" },
    active: { label: "Active", variant: "success" },
    in_progress: { label: "In Progress", variant: "info" },
    completed: { label: "Completed", variant: "default" },
    archived: { label: "Archived", variant: "outline" },
  };
  const s = map[status] ?? { label: status, variant: "outline" };
  return <Badge variant={s.variant as "default"}>{s.label}</Badge>;
}

export function ContentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "warning" | "info" | "success" | "outline" }> = {
    pending: { label: "Pending", variant: "outline" },
    submitted: { label: "Submitted", variant: "info" },
    in_progress: { label: "In Progress", variant: "warning" },
    done: { label: "Done", variant: "success" },
  };
  const s = map[status] ?? { label: status, variant: "outline" };
  return <Badge variant={s.variant as "default"}>{s.label}</Badge>;
}
