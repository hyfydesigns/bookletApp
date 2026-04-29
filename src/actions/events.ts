"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireOrganizer, getCurrentDbUser } from "@/lib/auth";
import { z } from "zod";
import { createNotification } from "./notifications";

const EventSchema = z.object({
  organizationId: z.string().min(1),
  name: z.string().min(1, "Event name is required"),
  eventDate: z.string().optional(),
  location: z.string().optional(),
  theme: z.string().optional(),
  totalPages: z.coerce.number().min(4).default(20),
  frontSectionPages: z.coerce.number().min(0).default(4),
  status: z
    .enum(["draft", "active", "in_progress", "completed", "archived"])
    .default("draft"),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.totalPages % 4 !== 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["totalPages"], message: "Total pages must be divisible by 4" });
  }
});

export async function createEvent(data: z.infer<typeof EventSchema>) {
  const user = await requireOrganizer();
  const parsed = EventSchema.parse(data);

  if (user.role !== "admin" && user.organizationId !== parsed.organizationId) {
    throw new Error("Unauthorized");
  }

  const event = await prisma.event.create({
    data: {
      ...parsed,
      eventDate: parsed.eventDate ? new Date(parsed.eventDate) : undefined,
      createdById: user.id,
    },
  });

  const admins = await prisma.user.findMany({ where: { role: "admin" } });
  for (const admin of admins) {
    await createNotification({
      userId: admin.id,
      type: "new_event",
      title: "New Event Created",
      message: `${user.name} created a new event: ${event.name}`,
      link: `/admin/events/${event.id}`,
    });
  }

  revalidatePath("/admin/events");
  revalidatePath("/dashboard");
  return event;
}

export async function updateEvent(id: string, data: Partial<z.infer<typeof EventSchema>>) {
  const user = await requireOrganizer();
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) throw new Error("Event not found");

  if (user.role !== "admin" && user.organizationId !== event.organizationId) {
    throw new Error("Unauthorized");
  }

  const updated = await prisma.event.update({
    where: { id },
    data: {
      ...data,
      eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
    },
  });
  revalidatePath(`/admin/events/${id}`);
  revalidatePath("/admin/events");
  return updated;
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
  revalidatePath("/admin/events");
}

export async function getEvents(organizationId?: string) {
  const user = await requireOrganizer();
  const orgId =
    user.role === "admin" ? organizationId : (user.organizationId ?? undefined);

  return prisma.event.findMany({
    where: {
      deletedAt: null,
      ...(orgId ? { organizationId: orgId } : {}),
    },
    include: {
      organization: { select: { id: true, name: true } },
      _count: { select: { ads: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEvent(id: string) {
  const user = await requireOrganizer();
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organization: true,
      ads: {
        orderBy: { createdAt: "desc" },
        include: { submittedBy: { select: { name: true, email: true } } },
      },
      frontContents: { orderBy: { contentType: "asc" } },
      createdBy: { select: { name: true, email: true } },
    },
  });

  if (!event) throw new Error("Event not found");
  if (
    user.role !== "admin" &&
    user.organizationId !== event.organizationId
  ) {
    throw new Error("Unauthorized");
  }
  return event;
}
