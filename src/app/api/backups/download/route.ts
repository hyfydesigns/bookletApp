import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { buildZipForBackup, safeFilename } from "@/lib/backup-zip";

export async function GET(_req: NextRequest) {
  await requireAdmin();

  const backups = await prisma.backup.findMany({ orderBy: { createdAt: "desc" } });
  if (backups.length === 0) return NextResponse.json({ error: "No backups" }, { status: 404 });

  const zip = new JSZip();
  for (const backup of backups) {
    const folder = zip.folder(`${safeFilename(backup.name)}-${backup.createdAt.toISOString().slice(0, 10)}`);
    if (folder) buildZipForBackup(folder, backup);
  }

  const buf = Buffer.from(await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" }));
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="bookletflow-all-backups-${date}.zip"`,
    },
  });
}
