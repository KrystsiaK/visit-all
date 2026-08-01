import type { WiringConfig } from "@synarava/wiring-engine";

/**
 * Entity signal keys that are published to the bus by EntitySignalBridge.
 * Any widget using usePortConsumer with these portKeys gets the bus value directly,
 * regardless of widget key — enabling AI-generated widgets to access entity data.
 */
export const ENTITY_SIGNAL_KEYS = [
  "entity_title",
  "entity_description",
  "entity_type",
  "entity_image",
  "entity_lat",
  "entity_lng",
  "entity_collection",
  "entity_rating",
] as const;

export type EntitySignalKey = (typeof ENTITY_SIGNAL_KEYS)[number];

export const ENTITY_SHELL_WIRING_CONFIG: WiringConfig = {
  shellId: "right_entity_shell",
  systemBindings: [],
  userConnections: [],
};