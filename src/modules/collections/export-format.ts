export const COLLECTION_EXPORT_FORMAT = "synarava-collection" as const;
export const COLLECTION_EXPORT_VERSION = "1.0" as const;

export interface CollectionExportNote {
  title: string | null;
  markdown: string;
}

export interface CollectionExportResource {
  label: string | null;
  url: string;
}

export interface CollectionExportMedia {
  url: string;
  caption: string | null;
}

interface CollectionExportEntityBase {
  title: string;
  rating: number | null;
  notes: CollectionExportNote[];
  resources: CollectionExportResource[];
  mediaUrls: CollectionExportMedia[];
}

export interface CollectionExportPin extends CollectionExportEntityBase {
  type: "pin";
  coordinates: { lng: number; lat: number };
}

export interface CollectionExportTrace extends CollectionExportEntityBase {
  type: "trace";
  coordinates: Array<{ lng: number; lat: number }>;
}

export interface CollectionExportArea extends CollectionExportEntityBase {
  type: "area";
  coordinates: Array<{ lng: number; lat: number }>;
}

export type CollectionExportEntity =
  | CollectionExportPin
  | CollectionExportTrace
  | CollectionExportArea;

export interface CollectionExportData {
  format: typeof COLLECTION_EXPORT_FORMAT;
  version: typeof COLLECTION_EXPORT_VERSION;
  exportedAt: string;
  collection: {
    name: string;
    color: string;
    icon: string;
  };
  entities: CollectionExportEntity[];
}

export function isCollectionExportData(value: unknown): value is CollectionExportData {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.format === COLLECTION_EXPORT_FORMAT &&
    typeof v.version === "string" &&
    typeof v.collection === "object" &&
    Array.isArray(v.entities)
  );
}

// ── JSON serialization ─────────────────────────────────────────────────────

export function serializeCollectionToJson(data: CollectionExportData): string {
  return JSON.stringify(data, null, 2);
}

export function parseCollectionFromJson(json: string): CollectionExportData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("Invalid JSON file.");
  }
  if (!isCollectionExportData(parsed)) {
    throw new Error('File does not look like a Synarava collection export. Expected format: "synarava-collection".');
  }
  return parsed;
}

// ── Markdown serialization ─────────────────────────────────────────────────

export function serializeCollectionToMd(data: CollectionExportData): string {
  const lines: string[] = [];

  lines.push("---");
  lines.push(`format: ${COLLECTION_EXPORT_FORMAT}`);
  lines.push(`version: "${data.version}"`);
  lines.push(`collection: "${data.collection.name}"`);
  lines.push(`color: "${data.collection.color}"`);
  lines.push(`icon: "${data.collection.icon}"`);
  lines.push(`exportedAt: "${data.exportedAt}"`);
  lines.push("---");
  lines.push("");
  lines.push(`# ${data.collection.name}`);
  lines.push("");

  for (const entity of data.entities) {
    const typeLabel = entity.type === "pin" ? "Pin" : entity.type === "trace" ? "Path" : "Zone";
    lines.push(`## ${typeLabel}: ${entity.title}`);
    lines.push("");

    if (entity.type === "pin") {
      lines.push(`**Coordinates:** ${entity.coordinates.lat}, ${entity.coordinates.lng}`);
    } else {
      const coords = entity.coordinates.map((c) => `[${c.lat}, ${c.lng}]`).join(", ");
      lines.push(`**Coordinates:** ${coords}`);
    }

    if (entity.rating !== null) {
      lines.push(`**Rating:** ${entity.rating}/5`);
    }

    if (entity.notes.length > 0) {
      lines.push("");
      lines.push("### Notes");
      for (const note of entity.notes) {
        if (note.title) lines.push(`#### ${note.title}`);
        lines.push("");
        lines.push(note.markdown);
        lines.push("");
      }
    }

    if (entity.resources.length > 0) {
      lines.push("");
      lines.push("### Resources");
      for (const res of entity.resources) {
        lines.push(`- [${res.label ?? res.url}](${res.url})`);
      }
    }

    if (entity.mediaUrls.length > 0) {
      lines.push("");
      lines.push("### Media");
      for (const media of entity.mediaUrls) {
        lines.push(`- ${media.url}${media.caption ? ` (${media.caption})` : ""}`);
      }
    }

    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

export function parseCollectionFromMd(md: string): CollectionExportData {
  const frontmatterMatch = md.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    throw new Error("Missing YAML frontmatter. File must start with ---.");
  }

  const fm = frontmatterMatch[1];
  const get = (key: string) => {
    const match = fm.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?`, "m"));
    return match?.[1]?.trim() ?? "";
  };

  if (get("format") !== COLLECTION_EXPORT_FORMAT) {
    throw new Error('File does not look like a Synarava collection export.');
  }

  const entities: CollectionExportEntity[] = [];
  const entityBlocks = md.split(/^## /m).slice(1);

  for (const block of entityBlocks) {
    const firstLine = block.split("\n")[0].trim();
    const typeMatch = firstLine.match(/^(Pin|Path|Zone):\s*(.+)$/);
    if (!typeMatch) continue;

    const rawType = typeMatch[1];
    const title = typeMatch[2].trim();
    const type = rawType === "Pin" ? "pin" : rawType === "Path" ? "trace" : "area";

    const coordMatch = block.match(/\*\*Coordinates:\*\*\s*(.+)/);
    const ratingMatch = block.match(/\*\*Rating:\*\*\s*(\d)/);
    const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : null;

    const notes: CollectionExportNote[] = [];
    const notesSection = block.match(/### Notes\n([\s\S]*?)(?=###|---|\n## |$)/);
    if (notesSection) {
      const noteBlocks = notesSection[1].split(/^#### /m);
      for (const nb of noteBlocks) {
        const content = nb.trim();
        if (content) {
          const lines = content.split("\n");
          const hasTitle = !lines[0].startsWith("#") && lines[0].length < 80;
          notes.push({
            title: hasTitle ? lines[0].trim() : null,
            markdown: (hasTitle ? lines.slice(1) : lines).join("\n").trim(),
          });
        }
      }
    }

    const resources: CollectionExportResource[] = [];
    const resourcesSection = block.match(/### Resources\n([\s\S]*?)(?=###|---|\n## |$)/);
    if (resourcesSection) {
      const resMatches = resourcesSection[1].matchAll(/- \[([^\]]*)\]\(([^)]+)\)/g);
      for (const m of resMatches) {
        resources.push({ label: m[1] || null, url: m[2] });
      }
    }

    const mediaUrls: CollectionExportMedia[] = [];
    const mediaSection = block.match(/### Media\n([\s\S]*?)(?=###|---|\n## |$)/);
    if (mediaSection) {
      const mediaLines = mediaSection[1].split("\n").filter((l) => l.startsWith("- "));
      for (const line of mediaLines) {
        const mediaMatch = line.match(/- (https?:\/\/\S+?)(?:\s+\((.+)\))?$/);
        if (mediaMatch) {
          mediaUrls.push({ url: mediaMatch[1], caption: mediaMatch[2] ?? null });
        }
      }
    }

    if (type === "pin" && coordMatch) {
      const parts = coordMatch[1].split(",").map((s) => parseFloat(s.trim()));
      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        entities.push({ type: "pin", title, coordinates: { lat: parts[0], lng: parts[1] }, rating, notes, resources, mediaUrls });
      }
    } else if ((type === "trace" || type === "area") && coordMatch) {
      const coordPairs = [...coordMatch[1].matchAll(/\[(-?[\d.]+),\s*(-?[\d.]+)\]/g)];
      const coordinates = coordPairs.map((m) => ({ lat: parseFloat(m[1]), lng: parseFloat(m[2]) }));
      entities.push({ type, title, coordinates, rating, notes, resources, mediaUrls });
    }
  }

  return {
    format: COLLECTION_EXPORT_FORMAT,
    version: COLLECTION_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    collection: {
      name: get("collection"),
      color: get("color") || "#0000ff",
      icon: get("icon") || "📍",
    },
    entities,
  };
}
