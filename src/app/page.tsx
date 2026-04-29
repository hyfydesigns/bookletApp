import { redirect } from "next/navigation";
import { getCurrentDbUser, getSupabaseUser } from "@/lib/auth";

export default async function RootPage() {
  const supabaseUser = await getSupabaseUser();
  if (!supabaseUser) redirect("/sign-in");

  const user = await getCurrentDbUser();
  if (!user) redirect("/onboarding");

  if (user.role === "admin") redirect("/admin/dashboard");
  if (!user.organizationId) redirect("/onboarding");
  redirect("/dashboard");
}
