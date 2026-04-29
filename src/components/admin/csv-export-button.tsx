"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CsvExportButtonProps {
  eventId: string;
  eventName: string;
}

export function CsvExportButton({ eventId, eventName }: CsvExportButtonProps) {
  const handleExport = async () => {
    const response = await fetch(`/api/export/ads?eventId=${eventId}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${eventName.replace(/\s+/g, "_")}_ads.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4 mr-1" />
      Export CSV
    </Button>
  );
}
