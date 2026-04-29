"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AdStatusFilterProps {
  currentStatus?: string;
  currentPayment?: string;
  eventId?: string;
}

const statuses = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "designing", label: "Designing" },
  { value: "complete", label: "Complete" },
];

const payments = [
  { value: "", label: "All Payments" },
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partial" },
  { value: "received", label: "Paid" },
];

export function AdStatusFilter({ currentStatus, currentPayment, eventId }: AdStatusFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = (status: string, payment: string) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (payment) params.set("payment", payment);
    const q = params.toString();
    router.push(`${pathname}${q ? `?${q}` : ""}`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex gap-1 flex-wrap">
        {statuses.map((s) => (
          <Button
            key={s.value}
            variant={currentStatus === s.value || (!currentStatus && !s.value) ? "default" : "outline"}
            size="sm"
            onClick={() => navigate(s.value, currentPayment ?? "")}
          >
            {s.label}
          </Button>
        ))}
      </div>
      <div className="flex gap-1 flex-wrap">
        {payments.map((p) => (
          <Button
            key={p.value}
            variant={currentPayment === p.value || (!currentPayment && !p.value) ? "secondary" : "outline"}
            size="sm"
            onClick={() => navigate(currentStatus ?? "", p.value)}
          >
            {p.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
