"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsRead } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";

export function MarkAllReadButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onClick = async () => {
    setLoading(true);
    await markAllNotificationsRead();
    router.refresh();
    setLoading(false);
  };

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={loading}>
      <CheckCheck className="h-4 w-4 mr-1" />
      {loading ? "..." : "Mark all read"}
    </Button>
  );
}
