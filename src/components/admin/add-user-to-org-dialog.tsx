"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addUserToOrganizationByEmail, removeUserFromOrganization } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, X, Users } from "lucide-react";

interface OrgMember {
  id: string;
  name: string | null;
  email: string;
}

interface AddUserToOrgDialogProps {
  organizationId: string;
  members: OrgMember[];
}

function RemoveButton({ userId, organizationId }: { userId: string; organizationId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeUserFromOrganization(userId, organizationId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRemove}
      disabled={loading}
      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
    >
      <X className="h-3.5 w-3.5" />
    </Button>
  );
}

export function OrgMembersCard({ organizationId, members }: AddUserToOrgDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const result = await addUserToOrganizationByEmail(email.trim(), organizationId);
      if (result.invited) {
        setSuccess(`Invite sent to ${email.trim()}. They'll be added to this organization when they sign up.`);
      } else {
        setSuccess(`${result.name || email.trim()} added successfully.`);
      }
      setEmail("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          Organizers ({members.length})
        </h3>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(null); setSuccess(null); setEmail(""); }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Add Member by Email</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label>Email address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); setSuccess(null); }}
                  placeholder="user@example.com"
                  autoFocus
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
                {success && <p className="text-xs text-green-600">{success}</p>}
              </div>
              <p className="text-xs text-muted-foreground">
                If the user already has an account they'll be added immediately. Otherwise a signup invite will be sent and they'll be assigned to this organization when they sign up.
              </p>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !email.trim()} className="flex-1">
                  {loading ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No members yet. Add one above.
            </div>
          ) : (
            <div className="divide-y">
              {members.map((user) => (
                <div key={user.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <RemoveButton userId={user.id} organizationId={organizationId} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
