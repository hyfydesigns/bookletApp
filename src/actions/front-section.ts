"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireOrganizer } from "@/lib/auth";
import { z } from "zod";
import { createNotification } from "./notifications";

const ContentSchema = z.object({
  eventId: z.string().min(1),
  contentType: z.enum([
    "president_photo",
    "welcome_address",
    "executives_list",
    "committee_members",
    "sponsors_list",
    "event_details",
    "other",
  ]),
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
    where: { eventId: parsed.eventId, contentType: parsed.contentType as "president_photo" | "welcome_address" | "executives_list" | "committee_members" | "sponsors_list" | "event_details" | "other" },
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
    orderBy: { contentType: "asc" },
    include: { submittedBy: { select: { name: true } } },
  });
}
