"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { backupAndDeleteOrganization, backupAndDeleteEvent } from "@/actions/backups";

interface Props {
  type: "organization" | "event";
  id: string;
  name: string;
  summary?: string;
  redirectTo?: string;
  variant?: "icon" | "button";
}

export function DeleteWithBackupDialog({ type, id, name, summary, redirectTo, variant = "button" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      if (type === "organization") {
        await backupAndDeleteOrganization(id);
      } else {
        await backupAndDeleteEvent(id);
      }
      setOpen(false);
      if (redirectTo) router.push(redirectTo);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
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
            <DialogTitle>Back up & delete {type}?</DialogTitle>
            <DialogDescription>
              A full backup will be saved before deletion. You can restore it
              any time from <strong>Admin → Backups</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border bg-muted/40 px-4 py-3 space-y-1">
            <p className="text-sm font-medium">{name}</p>
            {summary && <p className="text-xs text-muted-foreground">{summary}</p>}
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Backing up…</>
              ) : (
                "Back up & Delete"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
