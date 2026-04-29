import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2, CalendarDays, FileImage, Users, ArchiveRestore,
  CreditCard, Layout, BookOpen, ChevronRight, Shield, UserCircle,
} from "lucide-react";

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function Section({ icon, title, children }: SectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-1" />
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  );
}

function StatusRow({ label, variant, description }: { label: string; variant: string; description: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5 border-b last:border-0">
      <Badge variant="outline" className="text-xs flex-shrink-0 mt-0.5">{label}</Badge>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function HelpContent({ role }: { role: "admin" | "organizer" }) {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Overview */}
      <div>
        <h2 className="text-2xl font-bold">Help & Guide</h2>
        <p className="text-muted-foreground mt-1">
          BookletFlow helps organizations manage event booklet ads — from submission through design, payment, and page layout.
        </p>
      </div>

      {/* Role badge */}
      <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
        {role === "admin"
          ? <Shield className="h-4 w-4 text-primary" />
          : <UserCircle className="h-4 w-4 text-primary" />}
        <p className="text-sm">
          You are signed in as an <strong>{role === "admin" ? "Admin" : "Organizer"}</strong>.
          {role === "admin"
            ? " You have full access to all organizations, events, and system settings."
            : " You can submit and track ads for your organization's events."}
        </p>
      </div>

      {role === "admin" && (
        <>
          {/* Organizations */}
          <Section icon={<Building2 className="h-4 w-4 text-primary" />} title="Organizations">
            <div className="space-y-2">
              <Bullet>Go to <strong>Organizations</strong> in the sidebar to create and manage organizations.</Bullet>
              <Bullet>Each organization has its own members (organizers) and events.</Bullet>
              <Bullet>Use <strong>Add Member</strong> on the organization detail page to invite a user by email. If they don't have an account yet, they'll receive an invite email.</Bullet>
              <Bullet>Deleting an organization creates a full backup first — you can restore it from <strong>Backups</strong>.</Bullet>
            </div>
          </Section>

          {/* Events */}
          <Section icon={<CalendarDays className="h-4 w-4 text-primary" />} title="Events">
            <div className="space-y-3">
              <div className="space-y-2">
                <Bullet>Create events from the <strong>Events</strong> page or from an organization's detail page.</Bullet>
                <Bullet>Set <strong>Total Pages</strong> (must be divisible by 4) and <strong>Front Section Pages</strong> when creating an event.</Bullet>
                <Bullet>Move events through statuses as they progress.</Bullet>
              </div>
              <div className="pt-2 space-y-1.5">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Event Statuses</p>
                <StatusRow label="Draft" variant="outline" description="Event is being set up, not yet active." />
                <StatusRow label="Active" variant="outline" description="Accepting ad submissions from organizers." />
                <StatusRow label="In Progress" variant="outline" description="Design and layout work underway." />
                <StatusRow label="Completed" variant="outline" description="Booklet is finalized." />
                <StatusRow label="Archived" variant="outline" description="Event is closed and stored for reference." />
              </div>
            </div>
          </Section>

          {/* Ads */}
          <Section icon={<FileImage className="h-4 w-4 text-primary" />} title="Managing Ads">
            <div className="space-y-3">
              <div className="space-y-2">
                <Bullet>View all ads across events from <strong>Ad Queue</strong>, or drill into a specific event's ads.</Bullet>
                <Bullet>Assign a <strong>page number</strong> to place the ad in the booklet layout. Full-page ads occupy an entire page; half-page ads share a page with one other half-page ad.</Bullet>
                <Bullet>Upload the <strong>final design file</strong> once the ad artwork is ready — this marks the ad as Complete.</Bullet>
              </div>
              <div className="pt-2 space-y-1.5">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Ad Content Statuses</p>
                <StatusRow label="Pending" variant="outline" description="Submitted, waiting for design work to begin." />
                <StatusRow label="Designing" variant="outline" description="Ad is actively being designed." />
                <StatusRow label="Complete" variant="outline" description="Final design is uploaded and ready." />
              </div>
              <div className="pt-2 space-y-1.5">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Payment Statuses</p>
                <StatusRow label="Unpaid" variant="outline" description="No payment received yet." />
                <StatusRow label="Partial" variant="outline" description="A deposit has been received." />
                <StatusRow label="Received" variant="outline" description="Full payment confirmed." />
              </div>
            </div>
          </Section>

          {/* Users */}
          <Section icon={<Users className="h-4 w-4 text-primary" />} title="Users & Roles">
            <div className="space-y-2">
              <Bullet><strong>Admins</strong> have full system access — managing organizations, events, ads, users, and backups.</Bullet>
              <Bullet><strong>Organizers</strong> can submit and track ads for events belonging to their organization.</Bullet>
              <Bullet>Change a user's role from the <strong>Users</strong> page.</Bullet>
              <Bullet>Assign or move users between organizations from the <strong>Organizations</strong> detail page or the Users page.</Bullet>
            </div>
          </Section>

          {/* Backups */}
          <Section icon={<ArchiveRestore className="h-4 w-4 text-primary" />} title="Backups & Restore">
            <div className="space-y-2">
              <Bullet>Deleting an organization or event always creates a backup first — nothing is lost permanently.</Bullet>
              <Bullet>From the <strong>Backups</strong> page you can restore any backup, which recreates it as a draft with a "(Restored)" suffix.</Bullet>
              <Bullet>Download a backup as a <strong>.zip file</strong> to keep an offline copy.</Bullet>
              <Bullet>Upload a previously downloaded zip using <strong>Restore from ZIP</strong> — works for single-item zips and the "Download All" bundle.</Bullet>
            </div>
          </Section>
        </>
      )}

      {role === "organizer" && (
        <>
          {/* Submitting an ad */}
          <Section icon={<FileImage className="h-4 w-4 text-primary" />} title="Submitting an Ad">
            <div className="space-y-2">
              <Step n={1}>Go to <strong>My Events</strong> and open the event you want to advertise in.</Step>
              <Step n={2}>Click <strong>Add Ad</strong> and choose your ad type — Full Page or Half Page.</Step>
              <Step n={3}>Fill in the advertiser details, contact info, and any special instructions.</Step>
              <Step n={4}>Upload any reference files or artwork if you have them (optional at this stage).</Step>
              <Step n={5}>Submit the ad — your admin will be notified automatically.</Step>
            </div>
          </Section>

          {/* Tracking status */}
          <Section icon={<CreditCard className="h-4 w-4 text-primary" />} title="Tracking Your Ad">
            <div className="space-y-3">
              <div className="space-y-2">
                <Bullet>Open your event and click on an ad to see its full detail and current status.</Bullet>
                <Bullet>You'll see two statuses: <strong>Content Status</strong> (design progress) and <strong>Payment Status</strong>.</Bullet>
              </div>
              <div className="pt-1 space-y-1.5">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Content Statuses</p>
                <StatusRow label="Pending" variant="outline" description="Your ad is queued for design." />
                <StatusRow label="Designing" variant="outline" description="The design team is working on your ad." />
                <StatusRow label="Complete" variant="outline" description="Your ad design is finalized." />
              </div>
            </div>
          </Section>

          {/* Front section */}
          <Section icon={<Layout className="h-4 w-4 text-primary" />} title="Front Section Content">
            <div className="space-y-2">
              <Bullet>The front section of the booklet includes items like the welcome address, executive listing, and sponsor acknowledgements.</Bullet>
              <Bullet>Open an event and navigate to <strong>Front Section</strong> to submit your content for each item.</Bullet>
              <Bullet>You can attach files (photos, documents) and add body text for each section.</Bullet>
            </div>
          </Section>
        </>
      )}

      {/* Ad types — shown to both */}
      <Section icon={<BookOpen className="h-4 w-4 text-primary" />} title="Ad Types">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-md border p-4 space-y-1">
            <p className="font-semibold text-sm">Full Page</p>
            <p className="text-sm text-muted-foreground">Takes up an entire page in the booklet. Only one full-page ad can be assigned per page.</p>
          </div>
          <div className="rounded-md border p-4 space-y-1">
            <p className="font-semibold text-sm">Half Page</p>
            <p className="text-sm text-muted-foreground">Takes up half a page. Two half-page ads can share the same page (top and bottom slots).</p>
          </div>
        </div>
      </Section>

      {/* Need more help */}
      <div className="rounded-lg border bg-muted/30 px-4 py-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Need more help?</p>
        <p>Contact your BookletFlow administrator or reach out to the support team.</p>
      </div>
    </div>
  );
}
