@AGENTS.md

# BookletFlow

A Next.js web app for managing event program booklet ads — from submission through design, payment, and page layout.

## Tech Stack

- **Framework**: Next.js 16 (App Router) with React 19
- **Database**: Supabase PostgreSQL via Prisma ORM
- **Auth**: Supabase Auth (`@supabase/ssr`)
- **File uploads**: UploadThing
- **Email**: Resend + React Email templates
- **UI**: shadcn/ui (Radix UI + Tailwind CSS v4)
- **Forms**: react-hook-form + Zod
- **Zip handling**: JSZip (server-side in route handlers)

## Project Structure

```
src/
  app/
    (organizer)/        # Organizer-facing pages (dashboard, events, help)
    admin/              # Admin-facing pages
    api/
      uploadthing/      # UploadThing file router
      backups/          # Zip download + restore-from-zip route handlers
    auth/confirm/       # Supabase auth callback page (client component)
  actions/              # Server actions (ads, events, organizations, users, backups, front-section)
  components/
    admin/              # Admin-only components
    organizer/          # Organizer-only components
    shared/             # Shared components (sidebar, status badges, etc.)
    ui/                 # shadcn/ui primitives
  lib/
    supabase/           # server.ts, client.ts, middleware.ts
    backup-zip.ts       # JSZip helpers for building backup zip files
    prisma.ts
    uploadthing.ts
    utils.ts
```

## Roles

- **Admin**: Full access — manages organizations, events, ads, users, backups
- **Organizer**: Scoped to their organization — submits/tracks ads and front section content

## Key Features

### Auth & Invite Flow
- Sign-in/sign-up via Supabase Auth
- Admin invites users by email via `inviteUserByEmail`
- Invite email uses `{{ .TokenHash }}` directly in the link URL (bypasses PKCE): `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite`
- `/auth/confirm` is a client component that handles all token formats: `onAuthStateChange` (primary) → `getSession` → `exchangeCodeForSession` (code param) → `verifyOtp` (token_hash param) → 5s timeout fallback
- After auth, calls `syncUser()` server action then redirects to `/dashboard`

### Organizations & Events
- Organizations have members (organizers) assigned by email
- Events belong to organizations; total pages must be divisible by 4
- Event statuses: `draft` → `active` → `in_progress` → `completed` → `archived`

### Ads
- Ad types: `full_page` ($100) and `half_page` ($50)
- Half-page ads can share a page (top/bottom slots via `sharedPageWithAdId`)
- Content statuses: `pending` → `designing` → `complete`
- Payment statuses: `unpaid` → `partial` → `received`
- Admins can create ads on any event; organizers only on their own org's events
- File uploads support images, PDFs, and blobs (Word docs, etc.)

### Front Section
- Booklet front section content types: `president_photo`, `welcome_address`, `executives_list`, `committee_members`, `sponsors_list`, `event_details`, `other`
- Organizers submit content; admins manage status and add notes

### Backups
- Deleting an organization or event creates a JSON snapshot backup first (never permanently lost)
- Backups can be restored (recreated as draft with "(Restored)" suffix)
- Single backup or all backups can be downloaded as zip files
- Zips can be re-uploaded to restore via `POST /api/backups/restore-from-zip`

### Notifications
- In-app notifications for new ad submissions, status changes, payment updates

## Important Patterns

### Server Actions
All mutations go through server actions in `src/actions/`. Use `requireAdmin()` or `requireOrganizer()` from `src/lib/auth.ts` at the top of every action.

### Prisma Schema Notes
- `Ad.sharedPageWithAdId` uses `onDelete: SetNull` (self-referential FK — must not cascade)
- `Event` → `Organization` uses `onDelete: Cascade`
- `Backup` model stores JSON snapshots with `createdById` FK to User

### File Uploads (UploadThing)
Endpoints in `src/app/api/uploadthing/core.ts`:
- `adFiles` — images, PDFs, blobs (32MB) for ad reference files
- `finalDesign` — images, PDFs (64MB) for completed ad artwork
- `frontSectionFiles` — images, PDFs, blobs (32MB) for front section content
- `orgLogo` — images only (4MB)

Upload state is tracked as `{ url: string; name: string }[]` in components. Only `url[]` is persisted to DB; names are derived from UploadThing's `r.name` on upload.

### Zip Route Handlers
`src/app/api/backups/` route handlers use JSZip. Always generate with `type: "uint8array"` then wrap in `Buffer.from()` for Next.js `Response` compatibility — do NOT use `type: "nodebuffer"` as it breaks the response body type.

### Middleware
`src/lib/supabase/middleware.ts` makes all `/api/` routes public (no auth redirect). Protected routes redirect unauthenticated users to `/sign-in`.

## Email Templates
React Email templates live in `src/emails/`. Run `scripts/export-emails.ts` to generate HTML for the Supabase dashboard email templates. The invite template must use `{{ .TokenHash }}` (not `{{ .Token }}`), and the link format must be:
```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite
```
