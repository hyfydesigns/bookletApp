"use client";

import { useState, useRef } from "react";
import { Loader2, ArchiveRestore, Trash2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { restoreBackup, deleteBackup } from "@/actions/backups";

export function RestoreBackupButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleRestore() {
    setLoading(true);
    setError(null);
    try {
      await restoreBackup(id);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <ArchiveRestore className="h-4 w-4 mr-1.5" />
        Restore
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restore backup?</DialogTitle>
            <DialogDescription>
              A new copy of <strong>{name}</strong> will be created with status set to{" "}
              <strong>Draft</strong>. The backup will remain available.
            </DialogDescription>
          </DialogHeader>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {done && (
            <p className="text-sm text-green-600 font-medium">
              Restored successfully! Check Organizations or Events.
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={loading}>
              {done ? "Close" : "Cancel"}
            </Button>
            {!done && (
              <Button size="sm" onClick={handleRestore} disabled={loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Restoring…</>
                ) : (
                  "Restore"
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DownloadBackupButton({ id, name }: { id: string; name: string }) {
  return (
    <a href={`/api/backups/${id}/download`} download>
      <Button variant="ghost" size="sm" title={`Download ${name}`}>
        <Download className="h-4 w-4" />
      </Button>
    </a>
  );
}

export function RestoreFromZipButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restored, setRestored] = useState<string[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.name.endsWith(".zip")) {
      setError("Please select a .zip file");
      return;
    }
    setLoading(true);
    setError(null);
    setRestored(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/backups/restore-from-zip", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Restore failed");
      setRestored(json.restored);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restore failed");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setError(null);
    setRestored(null);
    if (inputRef.current) inputRef.current.value = "";
    if (restored) window.location.reload();
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4 mr-1.5" />
        Restore from ZIP
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restore from ZIP file</DialogTitle>
            <DialogDescription>
              Upload a backup zip downloaded from this page. Organizations and events
              will be recreated with a <strong>(Restored)</strong> suffix at draft status.
            </DialogDescription>
          </DialogHeader>

          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Restoring…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Drop zip file here or click to browse</p>
                <p className="text-xs text-muted-foreground">.zip files only</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          {restored && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 space-y-1">
              <p className="text-sm font-medium text-green-800">Restored successfully</p>
              {restored.map((r) => (
                <p key={r} className="text-xs text-green-700">{r}</p>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={handleClose} disabled={loading}>
              {restored ? "Close & Refresh" : "Cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DownloadAllBackupsButton() {
  return (
    <a href="/api/backups/download" download>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-1.5" />
        Download All
      </Button>
    </a>
  );
}

export function DeleteBackupButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      await deleteBackup(id);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete backup permanently?</DialogTitle>
            <DialogDescription>
              The backup for <strong>{name}</strong> will be permanently deleted.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Backup"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
