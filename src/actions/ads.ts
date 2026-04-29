"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireOrganizer } from "@/lib/auth";
import { z } from "zod";
import { getAdPrice } from "@/lib/utils";
import { createNotification } from "./notifications";

const AdSchema = z.object({
  eventId: z.string().min(1),
  adType: z.enum(["full_page", "half_page"]),
  advertiserName: z.string().min(1, "Advertiser name is required"),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  adMessage: z.string().optional(),
  notes: z.string().optional(),
  submittedFiles: z.array(z.string()).default([]),
});

async function getNextAdCode() {
  const count = await prisma.ad.count();
  return `AD-${String(count + 1).padStart(4, "0")}`;
}

export async function createAd(data: z.infer<typeof AdSchema>) {
  const user = await requireOrganizer();
  const parsed = AdSchema.parse(data);

  const event = await prisma.event.findUnique({
    where: { id: parsed.eventId },
    include: { organization: true },
  });
  if (!event) throw new Error("Event not found");
  if (user.role !== "admin" && user.organizationId !== event.organizationId) {
    throw new Error("Unauthorized");
  }

  const adCode = await getNextAdCode();
  const paymentAmount = getAdPrice(parsed.adType);

  const ad = await prisma.ad.create({
    data: {
      ...parsed,
      adCode,
      paymentAmount,
      submittedById: user.id,
    },
  });

  const admins = await prisma.user.findMany({ where: { role: "admin" } });
  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: "new_ad",
      title: "New Ad Submitted",
      message: `${parsed.advertiserName} submitted a ${parsed.adType.replace("_", " ")} ad for ${event.name}`,
      link: `/admin/events/${event.id}/ads/${ad.id}`,
    });
  }

  revalidatePath(`/admin/events/${parsed.eventId}/ads`);
  revalidatePath(`/events/${parsed.eventId}/ads`);
  return ad;
}

export async function updateAdStatus(
  id: string,
  adContentStatus: "pending" | "designing" | "complete"
) {
  await requireAdmin();
  const ad = await prisma.ad.update({
    where: { id },
    data: { adContentStatus },
    include: { event: true, submittedBy: true },
  });

  if (ad.submittedById) {
    await createNotification({
      userId: ad.submittedById,
      type: "ad_status_change",
      title: "Ad Status Updated",
      message: `Your ad "${ad.advertiserName}" is now ${adContentStatus.replace("_", " ")}`,
      link: `/events/${ad.eventId}/ads/${ad.id}`,
    });
  }

  revalidatePath(`/admin/events/${ad.eventId}/ads`);
  revalidatePath(`/admin/ads`);
  return ad;
}

export async function updateAdPayment(
  id: string,
  data: {
    paymentStatus: "unpaid" | "partial" | "received";
    amountPaid: number;
  }
) {
  const user = await requireOrganizer();
  const ad = await prisma.ad.update({
    where: { id },
    data,
    include: { event: true },
  });

  const admins = await prisma.user.findMany({ where: { role: "admin" } });
  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: "payment_update",
      title: "Payment Updated",
      message: `Payment for "${ad.advertiserName}" updated to ${data.paymentStatus}`,
      link: `/admin/events/${ad.eventId}/ads/${ad.id}`,
    });
  }

  revalidatePath(`/admin/events/${ad.eventId}/ads`);
  return ad;
}

export async function updateAdPageAssignment(
  id: string,
  pageNumber: number | null,
) {
  const user = await requireOrganizer();

  const ad = await prisma.ad.findUnique({ where: { id }, include: { event: true } });
  if (!ad) throw new Error("Ad not found");
  if (user.role !== "admin" && user.organizationId !== ad.event.organizationId) {
    throw new Error("Unauthorized");
  }

  const revalidate = (eventId: string) => {
    revalidatePath(`/admin/events/${eventId}/ads`);
    revalidatePath(`/events/${eventId}/ads`);
  };

  // Clear old shared link if this ad was previously paired
  if (ad.sharedPageWithAdId) {
    await prisma.ad.update({
      where: { id: ad.sharedPageWithAdId },
      data: { sharedPageWithAdId: null, pageSlot: null },
    });
  }

  if (!pageNumber) {
    const updated = await prisma.ad.update({
      where: { id },
      data: { pageNumber: null, pageSlot: null, sharedPageWithAdId: null },
    });
    revalidate(updated.eventId);
    return updated;
  }

  // Validate page number is within event bounds
  if (pageNumber > ad.event.totalPages) {
    throw new Error(`Page ${pageNumber} exceeds the event's total of ${ad.event.totalPages} pages`);
  }

  // Find all other ads already assigned to this page
  const adsOnPage = await prisma.ad.findMany({
    where: { eventId: ad.eventId, pageNumber, id: { not: id } },
  });

  if (ad.adType === "full_page") {
    if (adsOnPage.length > 0) {
      throw new Error(`Page ${pageNumber} is already occupied by another ad`);
    }
    const updated = await prisma.ad.update({
      where: { id },
      data: { pageNumber, pageSlot: "full", sharedPageWithAdId: null },
    });
    revalidate(updated.eventId);
    return updated;
  }

  // Half page — check for conflicts
  const fullPageOnThisPage = adsOnPage.find((a) => a.adType === "full_page");
  if (fullPageOnThisPage) {
    throw new Error(`Page ${pageNumber} already has a full-page ad`);
  }
  const halfPagesOnPage = adsOnPage.filter((a) => a.adType === "half_page");
  if (halfPagesOnPage.length >= 2) {
    throw new Error(`Page ${pageNumber} already has two half-page ads`);
  }

  const partner = halfPagesOnPage[0] ?? null;

  if (partner) {
    const partnerSlot: "top" | "bottom" = partner.pageSlot === "bottom" ? "bottom" : "top";
    const mySlot: "top" | "bottom" = partnerSlot === "top" ? "bottom" : "top";

    if (partner.sharedPageWithAdId && partner.sharedPageWithAdId !== id) {
      await prisma.ad.update({
        where: { id: partner.sharedPageWithAdId },
        data: { sharedPageWithAdId: null, pageSlot: null },
      });
    }

    await prisma.ad.update({
      where: { id: partner.id },
      data: { pageNumber, pageSlot: partnerSlot, sharedPageWithAdId: id },
    });
    const updated = await prisma.ad.update({
      where: { id },
      data: { pageNumber, pageSlot: mySlot, sharedPageWithAdId: partner.id },
    });
    revalidate(updated.eventId);
    return updated;
  }

  // No partner — assign as top by default, waiting for a partner
  const updated = await prisma.ad.update({
    where: { id },
    data: { pageNumber, pageSlot: "top", sharedPageWithAdId: null },
  });
  revalidate(updated.eventId);
  return updated;
}

export async function uploadFinalDesign(id: string, finalDesignUrl: string) {
  await requireAdmin();
  const ad = await prisma.ad.update({
    where: { id },
    data: { finalDesignUrl, adContentStatus: "complete" },
  });
  revalidatePath(`/admin/events/${ad.eventId}/ads`);
  return ad;
}

export async function updateAd(id: string, data: Partial<z.infer<typeof AdSchema>>) {
  const user = await requireOrganizer();
  const ad = await prisma.ad.findUnique({
    where: { id },
    include: { event: true },
  });
  if (!ad) throw new Error("Ad not found");

  if (user.role !== "admin") {
    if (ad.adContentStatus !== "pending") throw new Error("Cannot edit ad that is no longer pending");
    if (user.organizationId !== ad.event.organizationId) throw new Error("Unauthorized");
  }

  const updated = await prisma.ad.update({ where: { id }, data });
  revalidatePath(`/admin/events/${ad.eventId}/ads`);
  return updated;
}

export async function deleteAd(id: string) {
  await requireAdmin();
  const ad = await prisma.ad.delete({ where: { id } });
  revalidatePath(`/admin/events/${ad.eventId}/ads`);
  return ad;
}

export async function getAds(eventId: string) {
  const user = await requireOrganizer();
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found");
  if (user.role !== "admin" && user.organizationId !== event.organizationId) {
    throw new Error("Unauthorized");
  }

  return prisma.ad.findMany({
    where: { eventId },
    include: {
      submittedBy: { select: { name: true, email: true } },
      sharedPageWithAd: { select: { id: true, advertiserName: true, adCode: true } },
    },
    orderBy: [{ pageNumber: "asc" }, { createdAt: "asc" }],
  });
}

export async function getAllAds(filters?: {
  adContentStatus?: string;
  paymentStatus?: string;
}) {
  await requireAdmin();
  return prisma.ad.findMany({
    where: {
      ...(filters?.adContentStatus
        ? { adContentStatus: filters.adContentStatus as "pending" | "designing" | "complete" }
        : {}),
      ...(filters?.paymentStatus
        ? { paymentStatus: filters.paymentStatus as "unpaid" | "partial" | "received" }
        : {}),
    },
    include: {
      event: {
        include: { organization: { select: { name: true } } },
      },
      submittedBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getAd(id: string) {
  const user = await requireOrganizer();
  const ad = await prisma.ad.findUnique({
    where: { id },
    include: {
      event: { include: { organization: true } },
      submittedBy: { select: { name: true, email: true } },
      sharedPageWithAd: { select: { id: true, advertiserName: true, adCode: true } },
    },
  });
  if (!ad) throw new Error("Ad not found");
  if (user.role !== "admin" && user.organizationId !== ad.event.organizationId) {
    throw new Error("Unauthorized");
  }
  return ad;
}
