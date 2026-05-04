"use client";

import { Blocks, Compass, Globe2, Image, Layers3, Link2, Map, MapPin, NotebookPen, Route, Search, ShieldAlert, SlidersHorizontal, Star, UserRound, Wrench } from "lucide-react";

import type { WidgetDefinitionRecord } from "@/lib/widgets";
import { cn } from "@/components/ui/utils";

type PreviewTone = "mist" | "cream" | "rose" | "neutral";

type PreviewManifest = {
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: typeof MapPin;
  tone: PreviewTone;
  chips: string[];
  lines?: number;
};

const previewManifestByComponentKey: Record<string, PreviewManifest> = {
  global_overview: {
    eyebrow: "Global",
    title: "Workspace Overview",
    subtitle: "High-level map and shell summary.",
    icon: Globe2,
    tone: "mist",
    chips: ["Live", "Signals", "Overview"],
  },
  user_profile: {
    eyebrow: "User",
    title: "Profile",
    subtitle: "Identity, display name, avatar style.",
    icon: UserRound,
    tone: "neutral",
    chips: ["Identity", "Account"],
  },
  user_account_actions: {
    eyebrow: "User",
    title: "Account Actions",
    subtitle: "Verification, reset, password maintenance.",
    icon: ShieldAlert,
    tone: "neutral",
    chips: ["Security", "Auth"],
  },
  shell_header: {
    eyebrow: "Shell",
    title: "Header",
    subtitle: "Persistent shell framing and context.",
    icon: Blocks,
    tone: "mist",
    chips: ["Pinned", "Primary"],
  },
  shell_search: {
    eyebrow: "Shell",
    title: "Search",
    subtitle: "Local shell query input and filtering.",
    icon: Search,
    tone: "mist",
    chips: ["Filter", "Runtime"],
  },
  shell_mode_switch: {
    eyebrow: "Shell",
    title: "Mode Switch",
    subtitle: "Pins, paths, and zones interaction mode.",
    icon: Compass,
    tone: "mist",
    chips: ["Pin", "Trace", "Area"],
  },
  shell_collections: {
    eyebrow: "Shell",
    title: "Collections",
    subtitle: "Visible layers, editing state, selection target.",
    icon: Layers3,
    tone: "mist",
    chips: ["List", "Target", "Visibility"],
    lines: 4,
  },
  shell_controls: {
    eyebrow: "Shell",
    title: "Map Controls",
    subtitle: "Satellite, terrain, curve, and display toggles.",
    icon: SlidersHorizontal,
    tone: "mist",
    chips: ["Map", "View"],
  },
  shell_create_collection: {
    eyebrow: "Action",
    title: "Create Collection",
    subtitle: "Add a new layer target for authoring.",
    icon: Map,
    tone: "cream",
    chips: ["Create"],
  },
  shell_reset_view: {
    eyebrow: "Action",
    title: "Reset View",
    subtitle: "Return the map camera to the home frame.",
    icon: Compass,
    tone: "cream",
    chips: ["View"],
  },
  shell_finish_trace: {
    eyebrow: "Action",
    title: "Finish Path",
    subtitle: "Commit the drafted route geometry.",
    icon: Route,
    tone: "cream",
    chips: ["Commit", "Trace"],
  },
  shell_remove_trace_point: {
    eyebrow: "Action",
    title: "Remove Point",
    subtitle: "Delete the selected node from the draft.",
    icon: Wrench,
    tone: "cream",
    chips: ["Edit", "Trace"],
  },
  shell_chrome_primary: {
    eyebrow: "Chrome",
    title: "Primary Chrome",
    subtitle: "Brand and shell launcher controls.",
    icon: Blocks,
    tone: "mist",
    chips: ["Top", "Chrome"],
  },
  entity_info: {
    eyebrow: "Entity",
    title: "Entity Info",
    subtitle: "Summary, title, collection, primary metadata.",
    icon: MapPin,
    tone: "neutral",
    chips: ["Summary", "Primary"],
  },
  entity_delete: {
    eyebrow: "Entity",
    title: "Delete Entity",
    subtitle: "Dangerous action with confirmation flow.",
    icon: ShieldAlert,
    tone: "rose",
    chips: ["Danger"],
  },
  entity_gallery: {
    eyebrow: "Entity",
    title: "Gallery",
    subtitle: "Image/media strip for the active entity.",
    icon: Image,
    tone: "neutral",
    chips: ["Media", "Assets"],
  },
  entity_stories: {
    eyebrow: "Entity",
    title: "Stories",
    subtitle: "Narrative notes and markdown entries.",
    icon: NotebookPen,
    tone: "neutral",
    chips: ["Markdown", "Notes"],
  },
  entity_resources: {
    eyebrow: "Entity",
    title: "Resources",
    subtitle: "Links and rich external references.",
    icon: Link2,
    tone: "neutral",
    chips: ["Links", "Preview"],
  },
  entity_rating: {
    eyebrow: "Entity",
    title: "Rating",
    subtitle: "Structured qualitative scoring for pins.",
    icon: Star,
    tone: "cream",
    chips: ["1-5", "Score"],
  },
  entity_nearby_pins: {
    eyebrow: "Entity",
    title: "Nearby Pins",
    subtitle: "Contextual nearby places around the entity.",
    icon: MapPin,
    tone: "mist",
    chips: ["Spatial", "Discovery"],
  },
  entity_transport_mode: {
    eyebrow: "Entity",
    title: "Transport Mode",
    subtitle: "Travel mode enrichment for route entities.",
    icon: Route,
    tone: "cream",
    chips: ["Trace", "Metadata"],
  },
};

const toneClasses: Record<PreviewTone, string> = {
  neutral: "border-black/10 bg-white/72",
  mist: "border-[#7fc2e9]/28 bg-[#eef8ff]/78",
  cream: "border-[#f0cb62]/28 bg-[#fff5da]/80",
  rose: "border-[#e3a1a1]/28 bg-[#fff0f0]/80",
};

const chipToneClasses: Record<PreviewTone, string> = {
  neutral: "bg-white/88 text-neutral-700",
  mist: "bg-white/76 text-[#28506b]",
  cream: "bg-white/72 text-[#6d5319]",
  rose: "bg-white/72 text-[#744242]",
};

const fallbackPreview = (definition: WidgetDefinitionRecord): PreviewManifest => ({
  eyebrow: definition.layer === "shell" ? "Shell" : definition.layer === "entity" ? "Entity" : "Global",
  title: definition.name,
  subtitle: "Framework-native widget preview.",
  icon: Blocks,
  tone: "neutral",
  chips: [definition.layer],
});

export const LibraryWidgetPreview = ({
  definition,
}: {
  definition: WidgetDefinitionRecord;
}) => {
  const preview = previewManifestByComponentKey[definition.componentKey] ?? fallbackPreview(definition);
  const Icon = preview.icon;
  const lines = preview.lines ?? 3;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border p-4 shadow-[0px_12px_36px_rgba(0,0,0,0.07)]",
        toneClasses[preview.tone]
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.38),rgba(255,255,255,0.12)_38%,transparent_72%)]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
              {preview.eyebrow}
            </p>
            <h3 className="mt-2 truncate text-base font-semibold tracking-tight text-neutral-950">
              {preview.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-neutral-600">
              {preview.subtitle}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/82 text-neutral-900 shadow-[0px_6px_18px_rgba(0,0,0,0.06)]">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {preview.chips.map((chip) => (
            <span
              key={chip}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em]",
                chipToneClasses[preview.tone]
              )}
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          {Array.from({ length: lines }, (_, index) => (
            <div
              key={index}
              className="h-3 rounded-full bg-white/70"
              style={{
                width: index === lines - 1 ? "58%" : index === 0 ? "86%" : "72%",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
