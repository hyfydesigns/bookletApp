import { createClient } from "@/lib/supabase/server";
import { prisma } from "./prisma";

export async function getSupabaseUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentDbUser() {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) return null;

  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
    include: { organization: true },
  });
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentDbUser();
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }
  return user;
}

export async function requireOrganizer() {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function syncSupabaseUser() {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) return null;

  const email = supabaseUser.email ?? "";
  const name =
    supabaseUser.user_metadata?.full_name ??
    supabaseUser.user_metadata?.name ??
    email.split("@")[0] ??
    "User";

  const existing = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  });
  if (existing) return existing;

  const organizationId: string | undefined =
    supabaseUser.user_metadata?.organizationId ?? undefined;

  return prisma.user.create({
    data: {
      supabaseId: supabaseUser.id,
      name,
      email,
      role: "organizer",
      ...(organizationId ? { organizationId } : {}),
    },
  });
}
