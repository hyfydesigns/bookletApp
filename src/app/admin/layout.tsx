import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { getUnreadCount } from "@/actions/notifications";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") redirect("/dashboard");

  const unreadCount = await getUnreadCount();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="admin" />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar title="BookletFlow Admin" unreadCount={unreadCount} />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">{children}</main>
      </div>
    </div>
  );
}
