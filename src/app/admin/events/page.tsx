import { getEvents } from "@/actions/events";
import { getOrganizations } from "@/actions/organizations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { CalendarDays, MapPin, FileImage } from "lucide-react";
import Link from "next/link";
import { CreateEventDialog } from "@/components/admin/create-event-dialog";
import { DeleteWithBackupDialog } from "@/components/admin/delete-with-backup-dialog";

export default async function AdminEventsPage() {
  const [events, orgs] = await Promise.all([getEvents(), getOrganizations()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Events</h2>
          <p className="text-muted-foreground">{events.length} total events</p>
        </div>
        <CreateEventDialog organizations={orgs} />
      </div>

      {events.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <CalendarDays className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">No events yet</p>
              <p className="text-sm text-muted-foreground">Create your first event to start managing booklets</p>
            </div>
            <CreateEventDialog organizations={orgs} />
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id} className="hover:border-primary/50 transition-colors">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{event.name}</p>
                    <EventStatusBadge status={event.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="font-medium text-foreground/70">{event.organization.name}</span>
                    {event.eventDate && (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(event.eventDate)}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <FileImage className="h-3 w-3" />
                      {event._count.ads} ad{event._count.ads !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/admin/events/${event.id}`}>
                    <Button variant="outline" size="sm">Manage</Button>
                  </Link>
                  <DeleteWithBackupDialog
                    type="event"
                    id={event.id}
                    name={event.name}
                    summary={`${event._count.ads} ad${event._count.ads !== 1 ? "s" : ""} · ${event.organization.name}`}
                    redirectTo="/admin/events"
                    variant="icon"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
