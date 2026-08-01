import type { ComponentType } from "react";
import type { WidgetComponentKey } from "@/lib/widgets";
// entity widgets
import { EntityInfoWidgetCard } from "@/modules/entity/widgets/EntityInfoWidgetCard";
import { EntityDeleteWidgetCard } from "@/modules/entity/widgets/EntityDeleteWidgetCard";
import { EntityGalleryWidgetCard } from "@/modules/entity/widgets/EntityGalleryWidgetCard";
import { EntityNearbyPinsWidgetCard } from "@/modules/entity/widgets/EntityNearbyPinsWidgetCard";
import { EntityRatingWidgetCard } from "@/modules/entity/widgets/EntityRatingWidgetCard";
import { EntityResourcesWidgetCard } from "@/modules/entity/widgets/EntityResourcesWidgetCard";
import { EntityStoriesWidgetCard } from "@/modules/entity/widgets/EntityStoriesWidgetCard";
// global widgets
import { GlobalOverviewWidgetCard } from "@/components/widgets/global-widgets/GlobalOverviewWidgetCard";
// user shell widgets
import { UserProfileWidgetCard } from "@/components/widgets/user-widgets/UserProfileWidgetCard";
import { UserAccountActionsWidgetCard } from "@/components/widgets/user-widgets/UserAccountActionsWidgetCard";
// shell widgets
import { ShellCollectionsWidget } from "@/components/widgets/shell-widgets/ShellCollectionsWidget";
import { ShellSearchWidget } from "@/components/widgets/shell-widgets/ShellSearchWidget";
import { ShellClockWidget } from "@/components/widgets/shell-widgets/ShellClockWidget";
import { ShellModeSwitchWidget } from "@/components/widgets/shell-widgets/ShellModeSwitchWidget";
import { ShellControlsWidget } from "@/components/widgets/shell-widgets/ShellControlsWidget";
import { ShellCreateCollectionWidget } from "@/components/widgets/shell-widgets/ShellCreateCollectionWidget";
import { ShellResetViewWidget } from "@/components/widgets/shell-widgets/ShellResetViewWidget";
import { ShellNotesWidget } from "@/components/widgets/shell-widgets/ShellNotesWidget";
import { ShellFinishTraceWidget } from "@/components/widgets/shell-widgets/ShellFinishTraceWidget";
import { ShellRemoveTracePointWidget } from "@/components/widgets/shell-widgets/ShellRemoveTracePointWidget";
import { appWidgetRegistry } from "@/modules/shell/wiring/app-widget-definitions";

export interface WidgetManifestEntry {
  component: ComponentType;
  /** Suppress the drag handle (for CTA-style widgets that aren't repositioned by users) */
  hideHandle?: boolean;
  /** Which shells this widget can be placed in */
  shells: ("left" | "right" | "user")[];
  description: string;
}

export const GLOBAL_WIDGET_MANIFEST: Partial<Record<WidgetComponentKey, WidgetManifestEntry>> = {
  global_overview: {
    component: GlobalOverviewWidgetCard,
    shells: [],
    description: "Shared system overview for the active map workspace",
  },
};

export const GLOBAL_WIDGET_REGISTRY: Partial<Record<WidgetComponentKey, ComponentType>> = Object.fromEntries(
  Object.entries(GLOBAL_WIDGET_MANIFEST).map(([key, entry]) => [
    key,
    appWidgetRegistry.get(key)?.Component ?? entry.component,
  ])
) as Partial<Record<WidgetComponentKey, ComponentType>>;

export const ENTITY_WIDGET_MANIFEST: Partial<Record<WidgetComponentKey, WidgetManifestEntry>> = {
  entity_info: {
    component: EntityInfoWidgetCard,
    shells: ["right"],
    description: "Entity identity — title, type badge, inline editing",
  },
  entity_delete: {
    component: EntityDeleteWidgetCard,
    shells: ["right"],
    description: "Destructive delete action for the entity",
  },
  entity_gallery: {
    component: EntityGalleryWidgetCard,
    shells: ["right"],
    description: "Photo gallery for the entity",
  },
  entity_nearby_pins: {
    component: EntityNearbyPinsWidgetCard,
    shells: ["right"],
    description: "Nearby related pins ranked by proximity",
  },
  entity_rating: {
    component: EntityRatingWidgetCard,
    shells: ["right"],
    description: "Star rating for the entity",
  },
  entity_resources: {
    component: EntityResourcesWidgetCard,
    shells: ["right"],
    description: "External links and resource references",
  },
  entity_stories: {
    component: EntityStoriesWidgetCard,
    shells: ["right"],
    description: "Markdown notes and stories attached to the entity",
  },
};

export const ENTITY_WIDGET_REGISTRY: Partial<Record<WidgetComponentKey, ComponentType>> = Object.fromEntries(
  Object.entries(ENTITY_WIDGET_MANIFEST).map(([key, entry]) => [
    key,
    appWidgetRegistry.get(key)?.Component ?? entry.component,
  ])
) as Partial<Record<WidgetComponentKey, ComponentType>>;

export const USER_WIDGET_MANIFEST: Partial<Record<WidgetComponentKey, WidgetManifestEntry>> = {
  user_profile: {
    component: UserProfileWidgetCard,
    hideHandle: true,
    shells: ["user"],
    description: "Profile identity, avatar, and display name",
  },
  user_account_actions: {
    component: UserAccountActionsWidgetCard,
    hideHandle: true,
    shells: ["user"],
    description: "Email verification, password reset, and sign-out",
  },
};

export const USER_WIDGET_REGISTRY: Partial<Record<WidgetComponentKey, ComponentType>> = Object.fromEntries(
  Object.entries(USER_WIDGET_MANIFEST).map(([key, entry]) => [
    key,
    appWidgetRegistry.get(key)?.Component ?? entry.component,
  ])
) as Partial<Record<WidgetComponentKey, ComponentType>>;

export const WIDGET_MANIFEST: Partial<Record<WidgetComponentKey, WidgetManifestEntry>> = {
  shell_search: {
    component: ShellSearchWidget,
    shells: ["left"],
    description: "Search collections",
  },
  shell_mode_switch: {
    component: ShellModeSwitchWidget,
    shells: ["left"],
    description: "Switch interaction mode (pin / path / zone)",
  },
  shell_collections: {
    component: ShellCollectionsWidget,
    shells: ["left"],
    description: "Browse and manage collection layers",
  },
  shell_controls: {
    component: ShellControlsWidget,
    shells: ["left"],
    description: "Map display controls (satellite, 3D, curves)",
  },
  shell_create_collection: {
    component: ShellCreateCollectionWidget,
    hideHandle: true,
    shells: ["left"],
    description: "Create a new collection layer",
  },
  shell_reset_view: {
    component: ShellResetViewWidget,
    hideHandle: true,
    shells: ["left"],
    description: "Reset map view to default",
  },
  shell_notes: {
    component: ShellNotesWidget,
    shells: ["left", "user"],
    description: "Personal notes",
  },
  shell_clock: {
    component: ShellClockWidget,
    shells: ["left", "user"],
    description: "Local time clock",
  },
  shell_finish_trace: {
    component: ShellFinishTraceWidget,
    shells: ["left"],
    description: "Finish current path or zone drawing",
  },
  shell_remove_trace_point: {
    component: ShellRemoveTracePointWidget,
    shells: ["left"],
    description: "Undo points or cancel the current geometry draft",
  },
};

export const WIDGET_REGISTRY: Partial<Record<WidgetComponentKey, ComponentType>> = Object.fromEntries(
  Object.entries(WIDGET_MANIFEST).map(([key, entry]) => [
    key,
    appWidgetRegistry.get(key)?.Component ?? entry.component,
  ])
) as Partial<Record<WidgetComponentKey, ComponentType>>;
