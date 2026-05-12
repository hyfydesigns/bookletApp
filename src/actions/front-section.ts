"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireOrganizer } from "@/lib/auth";
import { z } from "zod";
import { createNotification } from "./notifications";

const ContentSchema = z.object({
  eventId: z.string().min(1),
  contentType: z.string().min(1),
  title: z.string().optional().default(""),
  bodyText: z.string().optional(),
  fileUrls: z.array(z.string()).default([]),
  adminNotes: z.string().optional(),
});

export async function upsertFrontSectionContent(
  data: z.infer<typeof ContentSchema>
) {
  const user = await requireOrganizer();
  const parsed = ContentSchema.parse(data);

  const event = await prisma.event.findUnique({
    where: { id: parsed.eventId },
  });
  if (!event) throw new Error("Event not found");
  if (user.role !== "admin" && user.organizationId !== event.organizationId) {
    throw new Error("Unauthorized");
  }

  const existing = await prisma.frontSectionContent.findFirst({
    where: { eventId: parsed.eventId, contentType: parsed.contentType },
  });

  let content;
  if (existing) {
    content = await prisma.frontSectionContent.update({
      where: { id: existing.id },
      data: {
        ...parsed,
        status: "submitted",
        submittedById: user.id,
      },
    });
  } else {
    content = await prisma.frontSectionContent.create({
      data: {
        ...parsed,
        status: "submitted",
        submittedById: user.id,
      },
    });
  }

  if (user.role !== "admin") {
    const admins = await prisma.user.findMany({ where: { role: "admin" } });
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        type: "new_content",
        title: "Front Section Content Submitted",
        message: `${user.name} submitted ${parsed.contentType.replace(/_/g, " ")} for ${event.name}`,
        link: `/admin/events/${event.id}/front-section`,
      });
    }
  }

  revalidatePath(`/admin/events/${parsed.eventId}/front-section`);
  revalidatePath(`/events/${parsed.eventId}/front-section`);
  return content;
}

export async function updateContentStatus(
  id: string,
  status: "pending" | "submitted" | "in_progress" | "done"
) {
  await requireAdmin();
  const content = await prisma.frontSectionContent.update({
    where: { id },
    data: { status },
  });
  revalidatePath(`/admin/events/${content.eventId}/front-section`);
  return content;
}

export async function getFrontSectionContents(eventId: string) {
  const user = await requireOrganizer();
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found");
  if (user.role !== "admin" && user.organizationId !== event.organizationId) {
    throw new Error("Unauthorized");
  }
  return prisma.frontSectionContent.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
    include: { submittedBy: { select: { name: true } } },
  });
}

export async function reorderFrontSection(eventId: string, orderedTypes: string[]) {
  await requireAdmin();
  await prisma.event.update({
    where: { id: eventId },
    data: { frontSectionOrder: orderedTypes },
  });
  revalidatePath(`/admin/events/${eventId}/front-section`);
  revalidatePath(`/events/${eventId}/front-section`);
}

export async function updateFrontSectionPageNumber(id: string, pageNumber: number | null) {
  await requireAdmin();
  const content = await prisma.frontSectionContent.update({
    where: { id },
    data: { pageNumber },
  });
  revalidatePath(`/admin/events/${content.eventId}/front-section`);
  return content;
}

export async function addFrontSectionItem(eventId: string, label: string) {
  await requireAdmin();
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found");

  // Generate a unique contentType key for this custom section
  const contentType = `custom_${Date.now()}`;

  const content = await prisma.frontSectionContent.create({
    data: {
      eventId,
      contentType,
      title: label,
      status: "pending",
    },
  });

  // Append to the event's order
  await prisma.event.update({
    where: { id: eventId },
    data: { frontSectionOrder: [...(event.frontSectionOrder ?? []), contentType] },
  });

  revalidatePath(`/admin/events/${eventId}/front-section`);
  return content;
}

export async function deleteFrontSectionItem(id: string) {
  await requireAdmin();
  const content = await prisma.frontSectionContent.delete({ where: { id } });

  // Remove from event order
  const event = await prisma.event.findUnique({ where: { id: content.eventId } });
  if (event) {
    await prisma.event.update({
      where: { id: content.eventId },
      data: {
        frontSectionOrder: (event.frontSectionOrder ?? []).filter(
          (t) => t !== content.contentType
        ),
      },
    });
  }

  revalidatePath(`/admin/events/${content.eventId}/front-section`);
}

export async function renameFrontSectionItem(id: string, title: string) {
  await requireAdmin();
  const content = await prisma.frontSectionContent.update({
    where: { id },
    data: { title },
  });
  revalidatePath(`/admin/events/${content.eventId}/front-section`);
  return content;
}
