"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole, updateUserOrganization } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserRoleManagerProps {
  userId: string;
  currentRole: string;
  organizations: { id: string; name: string }[];
  currentOrgId?: string;
}

export function UserRoleManager({ userId, currentRole, organizations, currentOrgId }: UserRoleManagerProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onRoleChange = async (role: string) => {
    setLoading(true);
    await updateUserRole(userId, role as "admin" | "organizer");
    router.refresh();
    setLoading(false);
  };

  const onOrgChange = async (orgId: string) => {
    setLoading(true);
    await updateUserOrganization(userId, orgId === "none" ? null : orgId);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Select defaultValue={currentRole} onValueChange={onRoleChange} disabled={loading}>
        <SelectTrigger className="w-32 h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="organizer">Organizer</SelectItem>
        </SelectContent>
      </Select>
      {currentRole === "organizer" && (
        <Select defaultValue={currentOrgId ?? "none"} onValueChange={onOrgChange} disabled={loading}>
          <SelectTrigger className="w-44 h-8 text-xs">
            <SelectValue placeholder="Assign org..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Organization</SelectItem>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
