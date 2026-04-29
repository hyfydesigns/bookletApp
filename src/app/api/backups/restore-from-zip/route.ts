import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Invalid zip file" }, { status: 400 });
  }

  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const filePaths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);

  try {
    const restored: string[] = [];

    if (filePaths.includes("organization.json")) {
      restored.push(await restoreOrgFromZip(zip, filePaths, admin.id, rand));
    } else if (filePaths.includes("event.json")) {
      restored.push(await restoreEventFromZip(zip, filePaths, admin.id, rand));
    } else {
      // All-backups zip — each top-level folder is one backup
      const topFolders = [...new Set(filePaths.map((p) => p.split("/")[0]))];
      for (const folder of topFolders) {
        const relative = filePaths
          .filter((p) => p.startsWith(folder + "/"))
          .map((p) => p.slice(folder.length + 1));
        const sub = zip.folder(folder)!;
        if (relative.includes("organization.json")) {
          restored.push(await restoreOrgFromZip(sub, relative, admin.id, rand));
        } else if (relative.includes("event.json")) {
          restored.push(await restoreEventFromZip(sub, relative, admin.id, rand));
        }
      }
    }

    revalidatePath("/admin/organizations");
    revalidatePath("/admin/events");
    revalidatePath("/admin/backups");

    return NextResponse.json({ restored });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Restore failed" },
      { status: 500 }
    );
  }
}

// ---- helpers ----

async function readJson(zip: JSZip, path: string): Promise<Record<string, unknown>> {
  const f = zip.file(path);
  if (!f) throw new Error(`Missing file in zip: ${path}`);
  return JSON.parse(await f.async("string"));
}

async function readJsonOpt(zip: JSZip, path: string): Promise<unknown[]> {
  const f = zip.file(path);
  if (!f) return [];
  return JSON.parse(await f.async("string"));
}

async function restoreOrgFromZip(
  zip: JSZip,
  filePaths: string[],
  adminId: string,
  rand: string
): Promise<string> {
  const orgData = await readJson(zip, "organization.json");

  const newOrg = await prisma.organization.create({
    data: {
      name: `${orgData.name} (Restored)`,
      logoUrl: (orgData.logoUrl as string) ?? null,
      contactPerson: (orgData.contactPerson as string) ?? null,
      email: (orgData.email as string) ?? null,
      phone: (orgData.phone as string) ?? null,
      address: (orgData.address as string) ?? null,
      notes: (orgData.notes as string) ?? null,
    },
  });

  // Find event folder names from paths like "events/{name}/event.json"
  const eventFolders = [
    ...new Set(
      filePaths
        .filter((p) => p.match(/^events\/[^/]+\/event\.json$/))
        .map((p) => p.replace(/\/event\.json$/, "").replace(/^events\//, ""))
    ),
  ];

  for (const folder of eventFolders) {
    const evData = await readJson(zip, `events/${folder}/event.json`);
    const ads = await readJsonOpt(zip, `events/${folder}/ads.json`);
    const frontContents = await readJsonOpt(zip, `events/${folder}/front-contents.json`);
    await restoreEventData(evData, ads, frontContents, newOrg.id, adminId, rand);
  }

  return `Organization: ${orgData.name}`;
}

async function restoreEventFromZip(
  zip: JSZip,
  _filePaths: string[],
  adminId: string,
  rand: string
): Promise<string> {
  const evData = await readJson(zip, "event.json");
  const ads = await readJsonOpt(zip, "ads.json");
  const frontContents = await readJsonOpt(zip, "front-contents.json");

  const orgId = evData.organizationId as string;
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org)
    throw new Error(
      `Organization for this event no longer exists. Restore the organization backup first.`
    );

  await restoreEventData(evData, ads, frontContents, orgId, adminId, rand);
  return `Event: ${evData.name}`;
}

type AdRow = {
  id: string; adCode: string; adType: string; advertiserName: string;
  contactPerson?: string; contactEmail?: string; contactPhone?: string;
  adContentStatus: string; paymentStatus: string; paymentAmount: unknown;
  amountPaid: unknown; pageNumber?: number; pageSlot?: string;
  sharedPageWithAdId?: string; adMessage?: string; notes?: string;
  submittedFiles?: string[]; finalDesignUrl?: string;
};

type ContentRow = {
  contentType: string; title: string; bodyText?: string;
  fileUrls?: string[]; status: string; adminNotes?: string;
};

async function restoreEventData(
  evData: Record<string, unknown>,
  ads: unknown[],
  frontContents: unknown[],
  organizationId: string,
  adminId: string,
  rand: string
) {
  const newEvent = await prisma.event.create({
    data: {
      organizationId,
      name: `${evData.name} (Restored)`,
      eventDate: evData.eventDate ? new Date(evData.eventDate as string) : null,
      location: (evData.location as string) ?? null,
      theme: (evData.theme as string) ?? null,
      totalPages: evData.totalPages as number,
      frontSectionPages: evData.frontSectionPages as number,
      status: "draft",
      notes: (evData.notes as string) ?? null,
      createdById: adminId,
    },
  });

  const adIdMap: Record<string, string> = {};

  for (const ad of ads as AdRow[]) {
    const newAd = await prisma.ad.create({
      data: {
        eventId: newEvent.id,
        adCode: `${ad.adCode}-R${rand}`,
        adType: ad.adType as "full_page" | "half_page",
        advertiserName: ad.advertiserName,
        contactPerson: ad.contactPerson ?? null,
        contactEmail: ad.contactEmail ?? null,
        contactPhone: ad.contactPhone ?? null,
        adContentStatus: ad.adContentStatus as "pending" | "designing" | "complete",
        paymentStatus: ad.paymentStatus as "unpaid" | "partial" | "received",
        paymentAmount: ad.paymentAmount as number,
        amountPaid: ad.amountPaid as number,
        pageNumber: ad.pageNumber ?? null,
        pageSlot: (ad.pageSlot ?? null) as "full" | "top" | "bottom" | null,
        adMessage: ad.adMessage ?? null,
        notes: ad.notes ?? null,
        submittedFiles: ad.submittedFiles ?? [],
        finalDesignUrl: ad.finalDesignUrl ?? null,
      },
    });
    adIdMap[ad.id] = newAd.id;
  }

  for (const ad of ads as AdRow[]) {
    if (ad.sharedPageWithAdId && adIdMap[ad.sharedPageWithAdId]) {
      await prisma.ad.update({
        where: { id: adIdMap[ad.id] },
        data: { sharedPageWithAdId: adIdMap[ad.sharedPageWithAdId] },
      });
    }
  }

  for (const c of frontContents as ContentRow[]) {
    await prisma.frontSectionContent.create({
      data: {
        eventId: newEvent.id,
        contentType: c.contentType as "president_photo" | "welcome_address" | "executives_list" | "committee_members" | "sponsors_list" | "event_details" | "other",
        title: c.title,
        bodyText: c.bodyText ?? null,
        fileUrls: c.fileUrls ?? [],
        status: c.status as "pending" | "submitted" | "in_progress" | "done",
        adminNotes: c.adminNotes ?? null,
      },
    });
  }
}
