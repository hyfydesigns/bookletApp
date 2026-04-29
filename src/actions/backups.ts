"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function backupAndDeleteOrganization(id: string) {
  const admin = await requireAdmin();

  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      events: {
        include: { ads: true, frontContents: true },
      },
    },
  });
  if (!org) throw new Error("Organization not found");

  await prisma.$transaction(async (tx) => {
    await tx.backup.create({
      data: { type: "organization", name: org.name, data: org as object, createdById: admin.id },
    });
    await tx.user.updateMany({ where: { organizationId: id }, data: { organizationId: null } });
    await tx.organization.delete({ where: { id } });
  });

  revalidatePath("/admin/organizations");
  revalidatePath("/admin/backups");
}

export async function backupAndDeleteEvent(id: string) {
  const admin = await requireAdmin();

  const event = await prisma.event.findUnique({
    where: { id },
    include: { ads: true, frontContents: true },
  });
  if (!event) throw new Error("Event not found");

  await prisma.$transaction(async (tx) => {
    await tx.backup.create({
      data: { type: "event", name: event.name, data: event as object, createdById: admin.id },
    });
    await tx.event.delete({ where: { id } });
  });

  revalidatePath("/admin/events");
  revalidatePath("/admin/backups");
}

export async function getBackups() {
  await requireAdmin();
  return prisma.backup.findMany({
    include: { createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function restoreBackup(id: string) {
  const admin = await requireAdmin();
  const backup = await prisma.backup.findUnique({ where: { id } });
  if (!backup) throw new Error("Backup not found");

  const data = backup.data as Record<string, unknown>;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();

  if (backup.type === "organization") {
    const orgData = data as {
      name: string; logoUrl?: string; contactPerson?: string; email?: string;
      phone?: string; address?: string; notes?: string;
      events: Array<{
        name: string; eventDate?: string; location?: string; theme?: string;
        totalPages: number; frontSectionPages: number; status: string; notes?: string;
        ads: AdBackup[]; frontContents: ContentBackup[];
      }>;
    };

    const newOrg = await prisma.organization.create({
      data: {
        name: `${orgData.name} (Restored)`,
        logoUrl: orgData.logoUrl ?? null,
        contactPerson: orgData.contactPerson ?? null,
        email: orgData.email ?? null,
        phone: orgData.phone ?? null,
        address: orgData.address ?? null,
        notes: orgData.notes ?? null,
      },
    });

    for (const ev of orgData.events ?? []) {
      await restoreEvent({ ...ev, organizationId: newOrg.id }, newOrg.id, admin.id, rand);
    }
  } else if (backup.type === "event") {
    const ev = data as EventBackup;
    const org = await prisma.organization.findUnique({ where: { id: ev.organizationId } });
    if (!org) throw new Error("Original organization no longer exists. Restore the organization backup first.");
    await restoreEvent(ev, ev.organizationId, admin.id, rand);
  }

  revalidatePath("/admin/organizations");
  revalidatePath("/admin/events");
  revalidatePath("/admin/backups");
}

export async function deleteBackup(id: string) {
  await requireAdmin();
  await prisma.backup.delete({ where: { id } });
  revalidatePath("/admin/backups");
}

// ---- helpers ----

type AdBackup = {
  id: string; adCode: string; adType: string; advertiserName: string;
  contactPerson?: string; contactEmail?: string; contactPhone?: string;
  adContentStatus: string; paymentStatus: string; paymentAmount: unknown;
  amountPaid: unknown; pageNumber?: number; pageSlot?: string;
  sharedPageWithAdId?: string; adMessage?: string; notes?: string;
  submittedFiles?: string[]; finalDesignUrl?: string;
};

type ContentBackup = {
  contentType: string; title: string; bodyText?: string;
  fileUrls?: string[]; status: string; adminNotes?: string;
};

type EventBackup = {
  organizationId: string; name: string; eventDate?: string; location?: string;
  theme?: string; totalPages: number; frontSectionPages: number;
  status: string; notes?: string; ads: AdBackup[]; frontContents: ContentBackup[];
};

async function restoreEvent(
  ev: EventBackup,
  organizationId: string,
  createdById: string,
  rand: string
) {
  const newEvent = await prisma.event.create({
    data: {
      organizationId,
      name: `${ev.name} (Restored)`,
      eventDate: ev.eventDate ? new Date(ev.eventDate) : null,
      location: ev.location ?? null,
      theme: ev.theme ?? null,
      totalPages: ev.totalPages,
      frontSectionPages: ev.frontSectionPages,
      status: "draft",
      notes: ev.notes ?? null,
      createdById,
    },
  });

  const adIdMap: Record<string, string> = {};

  for (const ad of ev.ads ?? []) {
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

  for (const ad of ev.ads ?? []) {
    if (ad.sharedPageWithAdId && adIdMap[ad.sharedPageWithAdId]) {
      await prisma.ad.update({
        where: { id: adIdMap[ad.id] },
        data: { sharedPageWithAdId: adIdMap[ad.sharedPageWithAdId] },
      });
    }
  }

  for (const c of ev.frontContents ?? []) {
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
