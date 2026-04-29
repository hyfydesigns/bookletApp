import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { buildZipForBackup, safeFilename } from "@/lib/backup-zip";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const backup = await prisma.backup.findUnique({ where: { id } });
  if (!backup) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const zip = new JSZip();
  buildZipForBackup(zip, backup);

  const buf = Buffer.from(await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" }));
  const filename = `${safeFilename(backup.name)}-backup-${backup.createdAt.toISOString().slice(0, 10)}.zip`;

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
