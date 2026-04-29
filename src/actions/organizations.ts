"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireOrganizer } from "@/lib/auth";
import { z } from "zod";

const OrgSchema = z.object({
  name: z.string().min(1, "Name is required"),
  logoUrl: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export async function createOrganization(data: z.infer<typeof OrgSchema>) {
  await requireAdmin();
  const parsed = OrgSchema.parse(data);
  const org = await prisma.organization.create({ data: parsed });
  revalidatePath("/admin/organizations");
  return org;
}

export async function updateOrganization(
  id: string,
  data: z.infer<typeof OrgSchema>
) {
  await requireAdmin();
  const parsed = OrgSchema.parse(data);
  const org = await prisma.organization.update({ where: { id }, data: parsed });
  revalidatePath("/admin/organizations");
  revalidatePath(`/admin/organizations/${id}`);
  return org;
}

export async function deleteOrganization(id: string) {
  await requireAdmin();
  await prisma.organization.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/admin/organizations");
}

export async function getOrganizations() {
  await requireAdmin();
  return prisma.organization.findMany({
    where: { deletedAt: null },
    include: { _count: { select: { events: true, users: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrganization(id: string) {
  await requireOrganizer();
  return prisma.organization.findUnique({
    where: { id },
    include: {
      events: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      },
      users: true,
      _count: { select: { events: true } },
    },
  });
}
