import JSZip from "jszip";

export function safeFilename(name: string) {
  return name.replace(/[^a-z0-9]/gi, "-").replace(/-+/g, "-").toLowerCase();
}

function pretty(obj: unknown) {
  return JSON.stringify(obj, null, 2);
}

export function buildZipForBackup(zip: JSZip, backup: { type: string; name: string; data: unknown }) {
  const data = backup.data as Record<string, unknown>;

  if (backup.type === "organization") {
    const orgData = data as {
      name: string;
      events?: Array<{ name: string; ads?: unknown[]; frontContents?: unknown[] } & Record<string, unknown>>;
    } & Record<string, unknown>;

    const { events, ...orgFields } = orgData;
    zip.file("organization.json", pretty(orgFields));

    for (const ev of events ?? []) {
      const { ads, frontContents, ...evFields } = ev;
      const folder = zip.folder(`events/${safeFilename(ev.name)}`);
      if (!folder) continue;
      folder.file("event.json", pretty(evFields));
      if (ads?.length) folder.file("ads.json", pretty(ads));
      if (frontContents?.length) folder.file("front-contents.json", pretty(frontContents));
    }
  } else if (backup.type === "event") {
    const { ads, frontContents, ...evFields } =
      data as { ads?: unknown[]; frontContents?: unknown[] } & Record<string, unknown>;
    zip.file("event.json", pretty(evFields));
    if (ads?.length) zip.file("ads.json", pretty(ads));
    if (frontContents?.length) zip.file("front-contents.json", pretty(frontContents));
  } else {
    zip.file("backup.json", pretty(data));
  }
}
