"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentDbUser } from "@/lib/auth";
import type { NotificationType } from "@/generated/prisma/client";

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: { userId, type, title, message, link },
  });
}

export async function getNotifications() {
  const user = await getCurrentDbUser();
  if (!user) return [];
  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markNotificationRead(id: string) {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true },
  });
  revalidatePath("/");
}

export async function markAllNotificationsRead() {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/");
}

export async function getUnreadCount() {
  const user = await getCurrentDbUser();
  if (!user) return 0;
  return prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });
}
