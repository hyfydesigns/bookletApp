"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { deleteAd } from "@/actions/ads";

interface Props {
  id: string;
  adCode: string;
  advertiserName: string;
  redirectTo?: string;
  variant?: "icon" | "button";
}

export function DeleteAdButton({ id, adCode, advertiserName, redirectTo, variant = "button" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      await deleteAd(id);
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setOpen(true)}
        >
          <Trash2 className="h-4 w-4 mr-1.5" />
          Delete
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete ad?</DialogTitle>
            <DialogDescription>
              This will permanently delete the ad. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border bg-muted/40 px-4 py-3 space-y-1">
            <p className="text-sm font-medium">{advertiserName}</p>
            <p className="text-xs text-muted-foreground font-mono">{adCode}</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Deleting…</> : "Delete Ad"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
