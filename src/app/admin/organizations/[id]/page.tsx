import { getOrganization } from "@/actions/organizations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { Building2, Mail, Phone, MapPin, CalendarDays, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const org = await getOrganization(id);
  if (!org) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/organizations">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold">{org.name}</h2>
          <p className="text-muted-foreground">{org.events.length} events</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Organization Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {org.logoUrl && (
              <img src={org.logoUrl} alt={org.name} className="h-16 w-16 rounded-lg object-cover" />
            )}
            {!org.logoUrl && (
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
            )}
            {org.contactPerson && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{org.contactPerson}</span>
              </div>
            )}
            {org.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {org.email}
              </div>
            )}
            {org.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {org.phone}
              </div>
            )}
            {org.address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                {org.address}
              </div>
            )}
            {org.notes && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">{org.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Events</h3>
            <Link href={`/admin/events?org=${org.id}`}>
              <Button variant="outline" size="sm">View All Events</Button>
            </Link>
          </div>

          {org.events.length === 0 && (
            <Card>
              <CardContent className="flex items-center justify-center py-10">
                <p className="text-muted-foreground text-sm">No events for this organization yet</p>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {org.events.map((event) => (
              <Card key={event.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        {event.eventDate && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(event.eventDate)}
                          </span>
                        )}
                        {event.location && <span>{event.location}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <EventStatusBadge status={event.status} />
                      <Link href={`/admin/events/${event.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {org.users.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Organizers</h3>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {org.users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
