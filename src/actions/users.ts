"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, syncSupabaseUser } from "@/lib/auth";
import { z } from "zod";

export async function syncUser() {
  return syncSupabaseUser();
}

export async function updateUserOrganization(
  userId: string,
  organizationId: string | null
) {
  await requireAdmin();
  const user = await prisma.user.update({
    where: { id: userId },
    data: { organizationId },
  });
  revalidatePath("/admin/organizations");
  return user;
}

export async function addUserToOrganizationByEmail(
  email: string,
  organizationId: string
) {
  await requireAdmin();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error(`No account found for ${email}. They must sign up first.`);
  if (user.organizationId === organizationId) throw new Error("User is already in this organization.");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { organizationId },
  });
  revalidatePath(`/admin/organizations/${organizationId}`);
  revalidatePath("/admin/users");
  return updated;
}

export async function removeUserFromOrganization(userId: string, organizationId: string) {
  await requireAdmin();
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { organizationId: null },
  });
  revalidatePath(`/admin/organizations/${organizationId}`);
  revalidatePath("/admin/users");
  return updated;
}

export async function updateUserRole(userId: string, role: "admin" | "organizer") {
  await requireAdmin();
  const user = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  revalidatePath("/admin");
  return user;
}

export async function getUsers() {
  await requireAdmin();
  return prisma.user.findMany({
    include: { organization: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

const OnboardingSchema = z.object({
  organizationId: z.string().optional(),
  newOrgName: z.string().optional(),
});

export async function completeOnboarding(data: z.infer<typeof OnboardingSchema>) {
  const currentUser = await syncSupabaseUser();
  if (!currentUser) throw new Error("Not authenticated");

  let orgId = data.organizationId;
  if (!orgId && data.newOrgName) {
    const org = await prisma.organization.create({
      data: { name: data.newOrgName },
    });
    orgId = org.id;
  }

  const user = await prisma.user.update({
    where: { id: currentUser.id },
    data: { organizationId: orgId },
  });
  revalidatePath("/dashboard");
  return user;
}
