import { getCurrentDbUser } from "@/lib/auth";
import { getEvents } from "@/actions/events";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { CreateEventDialog } from "@/components/admin/create-event-dialog";

export default async function OrganizerEventsPage() {
  const user = await getCurrentDbUser();
  if (!user?.organizationId) return null;

  const events = await getEvents(user.organizationId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Events</h2>
          <p className="text-muted-foreground">{events.length} event{events.length !== 1 ? "s" : ""}</p>
        </div>
        <CreateEventDialog
          organizations={[{ id: user.organizationId, name: user.organization?.name ?? "" }]}
          defaultOrgId={user.organizationId}
        />
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <CalendarDays className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No events yet</p>
            <CreateEventDialog
              organizations={[{ id: user.organizationId, name: user.organization?.name ?? "" }]}
              defaultOrgId={user.organizationId}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:border-primary/50 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{event.name}</p>
                      <EventStatusBadge status={event.status} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      {event.eventDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />{formatDate(event.eventDate)}
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{event.location}
                        </span>
                      )}
                      <span>{event._count.ads} ads</span>
                    </div>
                  </div>
                  <Link href={`/events/${event.id}`}>
                    <Button variant="outline" size="sm">Manage</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
