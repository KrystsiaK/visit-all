"use server";

import type { PoolClient } from "pg";
import { pool } from "@/lib/db";
import { auth } from "@/auth";
import {
  COLLECTION_EXPORT_FORMAT,
  COLLECTION_EXPORT_VERSION,
  type CollectionExportData,
  type CollectionExportEntity,
  type CollectionExportNote,
  type CollectionExportResource,
  type CollectionExportMedia,
} from "@/modules/collections/export-format";
import type { WidgetComponentKey, WidgetDefinitionRecord, WidgetEntityPayload, WidgetEntityType, WidgetInstanceRecord, WidgetLayerType } from "@/lib/widgets";
import type { WidgetPlacementRecord } from "@/lib/widgets";
import type { LeftSidebarShellInstance, TopChromeShellInstance, UserShellInstance } from "@/modules/shell/types";
import { defaultLeftSidebarShellConfig, defaultShellState, defaultTopChromeShellConfig } from "@/modules/shell/types";
import { SHELL_PANEL_WIDTH } from "@/modules/shell/constants";
import { getWidgetAllowedHosts, type WidgetHost } from "@/modules/shell/widget-hosts";
import {
  getWidgetPlacementPolicy,
  getWidgetPlacementState,
  type WidgetPlacementActionMode,
  type WidgetPlacementPolicy,
} from "@/modules/shell/widget-placement";
import { validateImageUpload } from "@/lib/security";
import { deleteUploadFromUrl, writeUpload, writeUploadAsset } from "@/lib/storage";
import { assertRateLimit } from "@/lib/rate-limit";
import {
  changeCurrentUserPassword as changeCurrentUserPasswordRecord,
  getCurrentUserProfile as getCurrentUserProfileRecord,
  getUserForPasswordReset,
  updateCurrentUserProfile as updateCurrentUserProfileRecord,
} from "@/lib/auth/users";
import { issueEmailVerification } from "@/lib/auth/email-verification";
import { issuePasswordReset } from "@/lib/auth/password-reset";

const requiredEntityWidgetSlugs = ["entity_info"] as const;

type AuthSessionUser = {
  id?: string;
};

export async function getUserId() {
  const session = await auth();
  const userId = (session?.user as AuthSessionUser | undefined)?.id;
  if (!userId) throw new Error("Unauthorized access. Active authenticated session required.");
  return userId;
}

const widgetLibrarySeed: Array<{
  slug: string;
  name: string;
  layer: WidgetLayerType;
  supportedEntityTypes: WidgetEntityType[];
  componentKey: WidgetComponentKey;
  defaultConfig: Record<string, unknown>;
}> = [
  {
    slug: "global_overview",
    name: "Global Overview",
    layer: "global",
    supportedEntityTypes: [],
    componentKey: "global_overview",
    defaultConfig: {},
  },
  {
    slug: "user_profile",
    name: "User Profile",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "user_profile",
    defaultConfig: {},
  },
  {
    slug: "user_account_actions",
    name: "Account Actions",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "user_account_actions",
    defaultConfig: {},
  },
  {
    slug: "shell_notes",
    name: "Shell Notes",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "shell_notes",
    defaultConfig: {
      title: "Notes",
      body: "Quick shell notes, reminders, or context that can travel between application panels.",
    },
  },
  {
    slug: "shell_clock",
    name: "Shell Clock",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "shell_clock",
    defaultConfig: {
      title: "Clock",
      timezoneMode: "local",
      format: "24h",
    },
  },
  {
    slug: "entity_info",
    name: "Entity Info",
    layer: "entity",
    supportedEntityTypes: ["pin", "trace", "area"],
    componentKey: "entity_info",
    defaultConfig: {},
  },
  {
    slug: "entity_delete",
    name: "Delete Entity",
    layer: "entity",
    supportedEntityTypes: ["pin", "trace", "area"],
    componentKey: "entity_delete",
    defaultConfig: {},
  },
  {
    slug: "entity_gallery",
    name: "Entity Gallery",
    layer: "entity",
    supportedEntityTypes: ["pin", "trace", "area"],
    componentKey: "entity_gallery",
    defaultConfig: {
      kind: "gallery",
      allowMultiple: true,
    },
  },
  {
    slug: "entity_stories",
    name: "Entity Stories",
    layer: "entity",
    supportedEntityTypes: ["pin", "trace", "area"],
    componentKey: "entity_stories",
    defaultConfig: {
      kind: "stories",
      format: "markdown",
      allowMultiple: true,
    },
  },
  {
    slug: "entity_resources",
    name: "Entity Resources",
    layer: "entity",
    supportedEntityTypes: ["pin", "trace", "area"],
    componentKey: "entity_resources",
    defaultConfig: {
      kind: "resources",
      allowMultiple: true,
    },
  },
  {
    slug: "entity_rating",
    name: "Entity Rating",
    layer: "entity",
    supportedEntityTypes: ["pin", "trace", "area"],
    componentKey: "entity_rating",
    defaultConfig: {
      kind: "rating",
      scale: 5,
    },
  },
  {
    slug: "entity_nearby_pins",
    name: "Nearby Pins",
    layer: "entity",
    supportedEntityTypes: ["pin", "trace", "area"],
    componentKey: "entity_nearby_pins",
    defaultConfig: {
      kind: "nearby_pins",
      maxItems: 3,
      minRating: 4,
    },
  },
  {
    slug: "entity_transport_mode",
    name: "Transport Mode",
    layer: "entity",
    supportedEntityTypes: ["pin", "trace", "area"],
    componentKey: "entity_transport_mode",
    defaultConfig: {
      kind: "transport_mode",
      options: ["walk", "car", "bus", "tram", "train", "ferry"],
      allowMultiple: false,
    },
  },
  {
    slug: "shell_chrome_primary",
    name: "Shell Chrome Primary",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "shell_chrome_primary",
    defaultConfig: {},
  },
  {
    slug: "shell_header",
    name: "Shell Header",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "shell_header",
    defaultConfig: {},
  },
  {
    slug: "shell_search",
    name: "Shell Search",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "shell_search",
    defaultConfig: {},
  },
  {
    slug: "shell_mode_switch",
    name: "Shell Mode Switch",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "shell_mode_switch",
    defaultConfig: {
      kind: "button_group",
      valueChannel: "interactionMode",
      buttons: [
        {
          id: "pins",
          label: "PINS",
          value: "pin",
          icon: "pin",
        },
        {
          id: "paths",
          label: "PATHS",
          value: "trace",
          icon: "route",
        },
        {
          id: "zones",
          label: "ZONES",
          value: "area",
          icon: "polygon",
          disabledChannel: "areasDisabled",
        },
      ],
    },
  },
  {
    slug: "shell_collections",
    name: "Shell Collections",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "shell_collections",
    defaultConfig: {},
  },
  {
    slug: "shell_controls",
    name: "Shell Controls",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "shell_controls",
    defaultConfig: {},
  },
  {
    slug: "shell_actions",
    name: "Shell Actions",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "shell_actions",
    defaultConfig: {},
  },
  {
    slug: "shell_create_collection",
    name: "Shell Create Collection",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "shell_create_collection",
    defaultConfig: {},
  },
  {
    slug: "shell_reset_view",
    name: "Shell Reset View",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "shell_reset_view",
    defaultConfig: {},
  },
  {
    slug: "shell_finish_trace",
    name: "Shell Finish Trace",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "shell_finish_trace",
    defaultConfig: {},
  },
  {
    slug: "shell_remove_trace_point",
    name: "Shell Remove Trace Point",
    layer: "shell",
    supportedEntityTypes: [],
    componentKey: "shell_remove_trace_point",
    defaultConfig: {},
  },
];

async function ensureWidgetLibrarySeed() {
  for (const widget of widgetLibrarySeed) {
    await pool.query(
      `
        INSERT INTO widget_definitions (
          slug, name, layer, supported_entity_types, component_key, default_config, is_system
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, TRUE)
        ON CONFLICT (slug) DO UPDATE
        SET
          name = EXCLUDED.name,
          layer = EXCLUDED.layer,
          supported_entity_types = EXCLUDED.supported_entity_types,
          component_key = EXCLUDED.component_key,
          default_config = EXCLUDED.default_config,
          is_system = EXCLUDED.is_system
      `,
      [
        widget.slug,
        widget.name,
        widget.layer,
        widget.supportedEntityTypes,
        widget.componentKey,
        JSON.stringify(widget.defaultConfig),
      ]
    );
  }

  await ensureWidgetSignalFrameworkSeed();
}

const signalFrameworkSeed = [
  {
    scopeType: "shell",
    signalKey: "shell.disabled",
    valueType: "boolean",
    description: "Published by a shell when hosted widgets should become disabled.",
  },
  {
    scopeType: "shell",
    signalKey: "shell.hidden",
    valueType: "boolean",
    description: "Published by a shell when hosted widgets should become visually hidden.",
  },
  {
    scopeType: "shell",
    signalKey: "shell.mode",
    valueType: "string",
    description: "Published by a shell to describe the active interaction mode.",
  },
  {
    scopeType: "shell",
    signalKey: "shell.collection_query",
    valueType: "string",
    description: "Published by a shell search widget to filter visible collections.",
  },
] as const;

const widgetPortSeed = [
  {
    widgetSlug: "shell_mode_switch",
    direction: "output",
    portKey: "selected_mode",
    valueType: "string",
    required: false,
    autoBindable: false,
    description: "Emits the selected interaction mode.",
  },
  {
    widgetSlug: "shell_mode_switch",
    direction: "input",
    portKey: "disabled",
    valueType: "boolean",
    required: false,
    autoBindable: true,
    description: "Disables mode switching when the shell locks interactions.",
  },
  {
    widgetSlug: "shell_search",
    direction: "output",
    portKey: "collection_query",
    valueType: "string",
    required: false,
    autoBindable: false,
    description: "Emits the current search query for collection filtering.",
  },
  {
    widgetSlug: "shell_search",
    direction: "input",
    portKey: "disabled",
    valueType: "boolean",
    required: false,
    autoBindable: true,
    description: "Disables the search widget from shell-level signals.",
  },
  {
    widgetSlug: "shell_collections",
    direction: "input",
    portKey: "filter_mode",
    valueType: "string",
    required: false,
    autoBindable: false,
    description: "Filters collections by interaction mode.",
  },
  {
    widgetSlug: "shell_collections",
    direction: "input",
    portKey: "collection_query",
    valueType: "string",
    required: false,
    autoBindable: false,
    description: "Filters collections by shell query.",
  },
  {
    widgetSlug: "shell_collections",
    direction: "input",
    portKey: "disabled",
    valueType: "boolean",
    required: false,
    autoBindable: true,
    description: "Disables collection interactions from shell-level signals.",
  },
  {
    widgetSlug: "entity_rating",
    direction: "input",
    portKey: "disabled",
    valueType: "boolean",
    required: false,
    autoBindable: true,
    description: "Disables rating changes when the hosting shell locks interactions.",
  },
] as const;

const shellSignalBindingSeed = [
  {
    widgetSlug: "shell_mode_switch",
    portKey: "disabled",
    signalKey: "shell.disabled",
    bindingMode: "auto",
    defaultEnabled: true,
  },
  {
    widgetSlug: "shell_search",
    portKey: "disabled",
    signalKey: "shell.disabled",
    bindingMode: "auto",
    defaultEnabled: true,
  },
  {
    widgetSlug: "shell_collections",
    portKey: "disabled",
    signalKey: "shell.disabled",
    bindingMode: "auto",
    defaultEnabled: true,
  },
  {
    widgetSlug: "entity_rating",
    portKey: "disabled",
    signalKey: "shell.disabled",
    bindingMode: "auto",
    defaultEnabled: true,
  },
] as const;

async function ensureWidgetSignalFrameworkSeed() {
  for (const signal of signalFrameworkSeed) {
    await pool.query(
      `
        INSERT INTO signal_definitions (
          scope_type,
          signal_key,
          value_type,
          description,
          is_system
        )
        VALUES ($1, $2, $3, $4, TRUE)
        ON CONFLICT (scope_type, signal_key) DO UPDATE
        SET
          value_type = EXCLUDED.value_type,
          description = EXCLUDED.description,
          is_system = EXCLUDED.is_system,
          updated_at = NOW()
      `,
      [signal.scopeType, signal.signalKey, signal.valueType, signal.description]
    );
  }

  for (const port of widgetPortSeed) {
    await pool.query(
      `
        INSERT INTO widget_ports (
          widget_definition_id,
          direction,
          port_key,
          value_type,
          required,
          auto_bindable,
          description
        )
        SELECT
          wd.id,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7
        FROM widget_definitions wd
        WHERE wd.slug = $1
        ON CONFLICT (widget_definition_id, direction, port_key) DO UPDATE
        SET
          value_type = EXCLUDED.value_type,
          required = EXCLUDED.required,
          auto_bindable = EXCLUDED.auto_bindable,
          description = EXCLUDED.description,
          updated_at = NOW()
      `,
      [
        port.widgetSlug,
        port.direction,
        port.portKey,
        port.valueType,
        port.required,
        port.autoBindable,
        port.description,
      ]
    );
  }

  for (const binding of shellSignalBindingSeed) {
    await pool.query(
      `
        INSERT INTO shell_signal_bindings (
          widget_definition_id,
          widget_port_id,
          signal_definition_id,
          binding_mode,
          default_enabled
        )
        SELECT
          wd.id,
          wp.id,
          sd.id,
          $4,
          $5
        FROM widget_definitions wd
        INNER JOIN widget_ports wp
          ON wp.widget_definition_id = wd.id
         AND wp.port_key = $2
        INNER JOIN signal_definitions sd
          ON sd.scope_type = 'shell'
         AND sd.signal_key = $3
        WHERE wd.slug = $1
        ON CONFLICT (widget_definition_id, widget_port_id, signal_definition_id) DO UPDATE
        SET
          binding_mode = EXCLUDED.binding_mode,
          default_enabled = EXCLUDED.default_enabled,
          updated_at = NOW()
      `,
      [
        binding.widgetSlug,
        binding.portKey,
        binding.signalKey,
        binding.bindingMode,
        binding.defaultEnabled,
      ]
    );
  }
}

async function ensureShellDefinitionSeed() {
  const definitions = [
    {
      slug: "left_sidebar",
      name: "Left Sidebar",
      config: defaultLeftSidebarShellConfig,
    },
    {
      slug: "top_chrome",
      name: "Top Chrome",
      config: defaultTopChromeShellConfig,
    },
    {
      slug: "user_shell",
      name: "User Shell",
      config: {
        version: 1,
        placement: "right",
        sizePreset: "regular",
        width: SHELL_PANEL_WIDTH,
        motionPreset: "overlay-soft",
      },
    },
    {
      slug: "pin_entity_shell",
      name: "Pin Entity Shell",
      config: {
        version: 1,
        placement: "right",
        sizePreset: "regular",
        width: SHELL_PANEL_WIDTH,
        motionPreset: "overlay-soft",
      },
    },
    {
      slug: "trace_entity_shell",
      name: "Trace Entity Shell",
      config: {
        version: 1,
        placement: "right",
        sizePreset: "regular",
        width: SHELL_PANEL_WIDTH,
        motionPreset: "overlay-soft",
      },
    },
    {
      slug: "area_entity_shell",
      name: "Area Entity Shell",
      config: {
        version: 1,
        placement: "right",
        sizePreset: "regular",
        width: SHELL_PANEL_WIDTH,
        motionPreset: "overlay-soft",
      },
    },
    {
      slug: "widget_center",
      name: "Widget Center",
      config: {
        version: 1,
        placement: "right",
        sizePreset: "regular",
        width: SHELL_PANEL_WIDTH,
        motionPreset: "overlay-soft",
      },
    },
    {
      slug: "widget_library",
      name: "Widget Library",
      config: {
        version: 1,
        placement: "center",
        sizePreset: "wide",
        width: 960,
        motionPreset: "overlay-soft",
      },
    },
  ] as const;

  for (const definition of definitions) {
    await pool.query(
      `
        INSERT INTO shell_definitions (
          slug,
          name,
          kind,
          scope,
          default_config,
          default_state,
          is_system
        )
        VALUES ($1, $2, 'panel', 'app', $3::jsonb, $4::jsonb, TRUE)
        ON CONFLICT (slug) DO NOTHING
      `,
      [
        definition.slug,
        definition.name,
        JSON.stringify(definition.config),
        JSON.stringify(defaultShellState),
      ]
    );
  }
}

async function ensureUserShellInstance(userId: string, slug: "left_sidebar" | "top_chrome" | "user_shell") {
  await ensureShellDefinitionSeed();

  await pool.query(
    `
      INSERT INTO shell_instances (definition_id, owner_type, owner_id, config, state)
      SELECT d.id, 'user', $1, d.default_config, d.default_state
      FROM shell_definitions d
      WHERE d.slug = $2
      AND NOT EXISTS (
        SELECT 1
        FROM shell_instances si
        WHERE si.definition_id = d.id
          AND si.owner_type = 'user'
          AND si.owner_id = $1
      )
    `,
    [userId, slug]
  );
}

const SHARED_ENTITY_SHELL_SLUG = "pin_entity_shell";
const SHARED_ENTITY_SHELL_OWNER_ID = "shared_entity_shell";
const sharedEntityWidgetComponentKeys = [
  "entity_info",
  "entity_rating",
  "entity_resources",
  "entity_stories",
  "entity_gallery",
  "entity_nearby_pins",
  "entity_transport_mode",
  "entity_delete",
] as const;
const legacyEntityShellSlugByType: Record<WidgetEntityType, string> = {
  pin: "pin_entity_shell",
  trace: "trace_entity_shell",
  area: "area_entity_shell",
};

async function ensureEntityShellInstance() {
  await ensureShellDefinitionSeed();

  await pool.query(
    `
      INSERT INTO shell_instances (definition_id, owner_type, owner_id, config, state)
      SELECT d.id, 'entity', $1, d.default_config, d.default_state
      FROM shell_definitions d
      WHERE d.slug = $2
      AND NOT EXISTS (
        SELECT 1
        FROM shell_instances si
        WHERE si.definition_id = d.id
          AND si.owner_type = 'entity'
          AND si.owner_id = $1
      )
    `,
    [SHARED_ENTITY_SHELL_OWNER_ID, SHARED_ENTITY_SHELL_SLUG]
  );
}

async function getShellInstanceIdForHost(
  client: PoolClient,
  userId: string,
  host: WidgetHost
) {
  if (host === "left_sidebar" || host === "top_chrome" || host === "user_shell") {
    await ensureUserShellInstance(userId, host);

    const shellResult = await client.query<{ id: string }>(
      `
        SELECT si.id
        FROM shell_instances si
        INNER JOIN shell_definitions sd ON sd.id = si.definition_id
        WHERE si.owner_type = 'user'
          AND si.owner_id::text = $1::text
          AND sd.slug = $2
        LIMIT 1
      `,
      [userId, host]
    );

    return shellResult.rows[0]?.id ?? null;
  }

  if (host === "shared_entity_shell") {
    await ensureEntityShellInstance();

    const shellResult = await client.query<{ id: string }>(
      `
        SELECT si.id
        FROM shell_instances si
        INNER JOIN shell_definitions sd ON sd.id = si.definition_id
        WHERE si.owner_type = 'entity'
          AND si.owner_id = $1
          AND sd.slug = $2
        LIMIT 1
      `,
      [SHARED_ENTITY_SHELL_OWNER_ID, SHARED_ENTITY_SHELL_SLUG]
    );

    return shellResult.rows[0]?.id ?? null;
  }

  return null;
}

function mapShellPlacementHost(ownerType: string, ownerId: string, shellSlug: string): WidgetHost | null {
  if (ownerType === "user" && shellSlug === "left_sidebar") {
    return "left_sidebar";
  }

  if (ownerType === "user" && shellSlug === "top_chrome") {
    return "top_chrome";
  }

  if (ownerType === "user" && shellSlug === "user_shell") {
    return "user_shell";
  }

  if (
    ownerType === "entity" &&
    ownerId === SHARED_ENTITY_SHELL_OWNER_ID &&
    shellSlug === SHARED_ENTITY_SHELL_SLUG
  ) {
    return "shared_entity_shell";
  }

  return null;
}

async function migrateLegacyEntityWidgetsToShared(
  userId: string,
  preferredEntityType?: WidgetEntityType
) {
  const sharedWidgets = await pool.query(
    `
      SELECT 1
      FROM widget_instances wi
      WHERE wi.user_id = $1
        AND wi.layer = 'entity'
        AND wi.entity_type IS NULL
        AND wi.entity_id IS NULL
      LIMIT 1
    `,
    [userId]
  );

  if (sharedWidgets.rowCount && sharedWidgets.rowCount > 0) {
    return;
  }

  const orderedLegacyTypes = (
    preferredEntityType
      ? [preferredEntityType, "pin", "trace", "area"]
      : ["pin", "trace", "area"]
  ).filter((entityType, index, values) => values.indexOf(entityType) === index) as WidgetEntityType[];

  for (const entityType of orderedLegacyTypes) {
    const legacyWidgets = await pool.query(
      `
        SELECT wi.id
        FROM widget_instances wi
        INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
        WHERE wi.user_id = $1
          AND wi.layer = 'entity'
          AND wi.entity_type = $2
          AND wi.entity_id IS NULL
          AND wd.component_key = ANY($3::text[])
        LIMIT 1
      `,
      [userId, entityType, [...sharedEntityWidgetComponentKeys]]
    );

    if (!legacyWidgets.rowCount) {
      continue;
    }

    await pool.query(
      `
        UPDATE widget_instances wi
        SET entity_type = NULL,
            updated_at = NOW()
        FROM widget_definitions wd
        WHERE wd.id = wi.definition_id
          AND wi.user_id = $1
          AND wi.layer = 'entity'
          AND wi.entity_type = $2
          AND wi.entity_id IS NULL
          AND wd.component_key = ANY($3::text[])
      `,
      [userId, entityType, [...sharedEntityWidgetComponentKeys]]
    );

    await pool.query(
      `
        WITH shared_shell AS (
          SELECT si.id
          FROM shell_instances si
          INNER JOIN shell_definitions sd ON sd.id = si.definition_id
          WHERE si.owner_type = 'entity'
            AND si.owner_id = $2
            AND sd.slug = $3
          LIMIT 1
        ),
        legacy_shell AS (
          SELECT si.id
          FROM shell_instances si
          INNER JOIN shell_definitions sd ON sd.id = si.definition_id
          WHERE si.owner_type = 'entity'
            AND si.owner_id = $4
            AND sd.slug = $5
          LIMIT 1
        )
        UPDATE widget_placements wp
        SET shell_instance_id = shared_shell.id,
            updated_at = NOW()
        FROM widget_instances wi, widget_definitions wd, shared_shell, legacy_shell
        WHERE wp.widget_instance_id = wi.id
          AND wp.shell_instance_id = legacy_shell.id
          AND wd.id = wi.definition_id
          AND wi.user_id = $1
          AND wi.layer = 'entity'
          AND wi.entity_type IS NULL
          AND wi.entity_id IS NULL
          AND wd.component_key = ANY($6::text[])
      `,
      [
        userId,
        SHARED_ENTITY_SHELL_OWNER_ID,
        SHARED_ENTITY_SHELL_SLUG,
        entityType,
        legacyEntityShellSlugByType[entityType],
        [...sharedEntityWidgetComponentKeys],
      ]
    );

    return;
  }
}

async function ensureDefaultShellWidgets(userId: string, shellSlug: "left_sidebar" | "top_chrome" | "user_shell") {
  await ensureWidgetLibrarySeed();
  await ensureUserShellInstance(userId, shellSlug);
  const desiredSlotForSlug = (slug: string) => (slug === "shell_header" ? "pinned" : "main");

  const desiredWidgets =
    shellSlug === "top_chrome"
      ? ([{ slug: "shell_chrome_primary", position: 0 }] as const)
      : shellSlug === "user_shell"
        ? ([
          { slug: "user_profile", position: 0 },
          { slug: "user_account_actions", position: 1 },
        ] as const)
        : ([
          { slug: "shell_header", position: 0 },
          { slug: "shell_search", position: 1 },
          { slug: "shell_mode_switch", position: 2 },
          { slug: "shell_finish_trace", position: 3 },
          { slug: "shell_remove_trace_point", position: 4 },
          { slug: "shell_collections", position: 5 },
          { slug: "shell_create_collection", position: 6 },
          { slug: "shell_reset_view", position: 7 },
          { slug: "shell_controls", position: 8 },
        ] as const);

  for (const widget of desiredWidgets) {
    await pool.query(
      `
        INSERT INTO widget_instances (definition_id, layer, position, title, user_id)
        SELECT d.id, 'shell', $2, d.name, $1
        FROM widget_definitions d
        WHERE d.slug = $3
        AND NOT EXISTS (
          SELECT 1
          FROM widget_instances wi
          WHERE wi.user_id = $1
            AND wi.layer = 'shell'
            AND wi.definition_id = d.id
        )
        RETURNING id
      `,
      [userId, widget.position, widget.slug]
    );
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const shellResult = await client.query(
      `
        SELECT si.id
        FROM shell_instances si
        INNER JOIN shell_definitions sd ON sd.id = si.definition_id
        WHERE si.owner_type = 'user'
          AND si.owner_id = $1
          AND sd.slug = $2
        LIMIT 1
      `,
      [userId, shellSlug]
    );

    const shellInstanceId = shellResult.rows[0]?.id as string | undefined;

    if (!shellInstanceId) {
      throw new Error(`Shell instance not found for ${shellSlug}.`);
    }

    const desiredInstanceRows = await client.query(
      `
        SELECT
          wi.id as "widgetInstanceId",
          wd.slug
        FROM widget_instances wi
        INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
        WHERE wi.user_id = $1
          AND wi.layer = 'shell'
          AND wd.slug = ANY($2::text[])
      `,
      [userId, desiredWidgets.map((widget) => widget.slug)]
    );

    const desiredInstanceIdBySlug = new Map<string, string>(
      desiredInstanceRows.rows.map((row) => [row.slug as string, row.widgetInstanceId as string])
    );

    const placementRows = await client.query(
      `
        SELECT
          wp.id,
          wp.widget_instance_id as "widgetInstanceId",
          wp.slot,
          wp.position,
          wd.slug
        FROM widget_placements wp
        INNER JOIN widget_instances wi ON wi.id = wp.widget_instance_id
        INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
        WHERE wp.shell_instance_id = $1
        ORDER BY wp.position ASC, wp.created_at ASC
      `,
      [shellInstanceId]
    );

    const existingPlacementByWidgetInstanceId = new Map<string, { id: string; slug: string; position: number }>(
      placementRows.rows.map((row) => [
        row.widgetInstanceId as string,
        {
          id: row.id as string,
          slug: row.slug as string,
          position: row.position as number,
        },
      ])
    );

    const maxExistingPosition = placementRows.rows.reduce(
      (max, row) => Math.max(max, row.position as number),
      -1
    );

    let nextInsertPosition = maxExistingPosition + 100;

    for (const widget of desiredWidgets) {
      const widgetInstanceId = desiredInstanceIdBySlug.get(widget.slug);

      if (!widgetInstanceId || existingPlacementByWidgetInstanceId.has(widgetInstanceId)) {
        continue;
      }

      const insertResult = await client.query(
        `
          INSERT INTO widget_placements (shell_instance_id, widget_instance_id, slot, position)
          VALUES ($1, $2::uuid, $3, $4)
          RETURNING id
        `,
        [shellInstanceId, widgetInstanceId, desiredSlotForSlug(widget.slug), nextInsertPosition]
      );

      existingPlacementByWidgetInstanceId.set(widgetInstanceId, {
        id: insertResult.rows[0].id as string,
        slug: widget.slug,
        position: nextInsertPosition,
      });

      nextInsertPosition += 1;
    }

    const refreshedPlacementRows = await client.query(
      `
        SELECT
          wp.id,
          wp.widget_instance_id as "widgetInstanceId",
          wp.slot,
          wp.position,
          wd.slug
        FROM widget_placements wp
        INNER JOIN widget_instances wi ON wi.id = wp.widget_instance_id
        INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
        WHERE wp.shell_instance_id = $1
        ORDER BY wp.position ASC, wp.created_at ASC
      `,
      [shellInstanceId]
    );

    const desiredPlacementIds = desiredWidgets
      .map((widget) => desiredInstanceIdBySlug.get(widget.slug))
      .filter((value): value is string => !!value)
      .map((widgetInstanceId) => {
        const placement = refreshedPlacementRows.rows.find(
          (row) => (row.widgetInstanceId as string) === widgetInstanceId
        );

        return placement?.id as string | undefined;
      })
      .filter((value): value is string => !!value);

    for (const row of refreshedPlacementRows.rows) {
      const desiredSlot = desiredSlotForSlug(row.slug as string);
      const currentSlot = row.slot as string;

      if (currentSlot !== desiredSlot) {
        await client.query(
          `
            UPDATE widget_placements
            SET slot = $2,
                updated_at = NOW()
            WHERE id = $1::uuid
          `,
          [row.id as string, desiredSlot]
        );
      }
    }

    const remainingPlacementIds = refreshedPlacementRows.rows
      .filter((row) => !desiredPlacementIds.includes(row.id as string))
      .map((row) => row.id as string);

    const orderedPlacementIds = [...desiredPlacementIds, ...remainingPlacementIds];

    await client.query(
      `
        UPDATE widget_placements
        SET
          position = position + 1000,
          updated_at = NOW()
        WHERE shell_instance_id = $1
      `,
      [shellInstanceId]
    );

    for (const [position, placementId] of orderedPlacementIds.entries()) {
      await client.query(
        `
          UPDATE widget_placements
          SET
            position = $3,
            updated_at = NOW()
          WHERE shell_instance_id = $1
            AND id = $2::uuid
        `,
        [shellInstanceId, placementId, position]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getUserShellInstanceRecord<TShellInstance>(userId: string, slug: "left_sidebar" | "top_chrome" | "user_shell") {
  const { rows } = await pool.query(
    `
      SELECT
        si.id,
        sd.slug,
        sd.name,
        sd.kind,
        sd.scope,
        si.owner_type as "ownerType",
        si.owner_id as "ownerId",
        si.config,
        si.state
      FROM shell_instances si
      INNER JOIN shell_definitions sd ON sd.id = si.definition_id
      WHERE si.owner_type = 'user'
        AND si.owner_id::text = $1::text
        AND sd.slug = $2
      LIMIT 1
    `,
    [userId, slug]
  );

  return (rows[0] ?? null) as TShellInstance | null;
}

async function getUserShellWidgetsRecord(userId: string, shellSlug: "left_sidebar" | "top_chrome" | "user_shell") {
  const { rows } = await pool.query(
    `
      SELECT
        wp.id,
        wp.shell_instance_id as "shellInstanceId",
        wp.widget_instance_id as "widgetInstanceId",
        wp.slot,
        wp.position,
        wi.definition_id as "definitionId",
        wd.slug,
        COALESCE(wi.title, wd.name) as name,
        wi.layer,
        wi.entity_type as "entityType",
        wi.entity_id as "entityId",
        wd.component_key as "componentKey",
        COALESCE(wd.default_config, '{}'::jsonb) || COALESCE(wi.config, '{}'::jsonb) as config,
        wi.state,
        wi.runtime_overrides as "runtimeOverrides"
      FROM widget_placements wp
      INNER JOIN widget_instances wi ON wi.id = wp.widget_instance_id
      INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
      INNER JOIN shell_instances si ON si.id = wp.shell_instance_id
      INNER JOIN shell_definitions sd ON sd.id = si.definition_id
      WHERE si.owner_type = 'user'
        AND si.owner_id::text = $1::text
        AND sd.slug = $2
        AND wi.layer = 'shell'
      ORDER BY wp.position ASC, wp.created_at ASC
    `,
    [userId, shellSlug]
  );

  return rows as Array<WidgetPlacementRecord & WidgetInstanceRecord>;
}

async function getLeftSidebarShellByUserId(userId: string): Promise<LeftSidebarShellInstance> {
  return await getUserShellInstanceRecord<LeftSidebarShellInstance>(userId, "left_sidebar") as LeftSidebarShellInstance;
}

async function getTopChromeShellByUserId(userId: string): Promise<TopChromeShellInstance> {
  return await getUserShellInstanceRecord<TopChromeShellInstance>(userId, "top_chrome") as TopChromeShellInstance;
}

async function getUserShellByUserId(userId: string): Promise<UserShellInstance> {
  return await getUserShellInstanceRecord<UserShellInstance>(userId, "user_shell") as UserShellInstance;
}

async function getLeftSidebarShellWidgetsByUserId(userId: string) {
  return getUserShellWidgetsRecord(userId, "left_sidebar");
}

async function getTopChromeShellWidgetsByUserId(userId: string) {
  return getUserShellWidgetsRecord(userId, "top_chrome");
}

async function getUserShellWidgetsByUserId(userId: string) {
  return getUserShellWidgetsRecord(userId, "user_shell");
}

export async function getLeftSidebarShell(): Promise<LeftSidebarShellInstance> {
  const userId = await getUserId();
  return getLeftSidebarShellByUserId(userId);
}

export async function getTopChromeShell(): Promise<TopChromeShellInstance> {
  const userId = await getUserId();
  return getTopChromeShellByUserId(userId);
}

export async function getUserShell(): Promise<UserShellInstance> {
  const userId = await getUserId();
  return getUserShellByUserId(userId);
}

export async function getLeftSidebarShellWidgets() {
  const userId = await getUserId();
  return getLeftSidebarShellWidgetsByUserId(userId);
}

export async function getTopChromeShellWidgets() {
  const userId = await getUserId();
  return getTopChromeShellWidgetsByUserId(userId);
}

export async function getUserShellWidgets() {
  const userId = await getUserId();
  return getUserShellWidgetsByUserId(userId);
}

export async function getHomeShellSnapshot() {
  const userId = await getUserId();

  const [
    leftSidebarShell,
    leftSidebarWidgets,
    topChromeShell,
    topChromeWidgets,
    userShell,
    userShellWidgets,
    userProfile,
  ] = await Promise.all([
    getLeftSidebarShellByUserId(userId),
    getLeftSidebarShellWidgetsByUserId(userId),
    getTopChromeShellByUserId(userId),
    getTopChromeShellWidgetsByUserId(userId),
    getUserShellByUserId(userId),
    getUserShellWidgetsByUserId(userId),
    getCurrentUserProfileRecord(userId),
  ]);

  return {
    leftSidebarShell,
    leftSidebarWidgets,
    topChromeShell,
    topChromeWidgets,
    userShell,
    userShellWidgets,
    userProfile,
    bootstrapRequired:
      !leftSidebarShell ||
      !topChromeShell ||
      !userShell ||
      leftSidebarWidgets.length === 0 ||
      topChromeWidgets.length === 0 ||
      userShellWidgets.length === 0,
  };
}

export async function bootstrapHomeShellState() {
  const userId = await getUserId();

  await Promise.all([
    ensureDefaultShellWidgets(userId, "left_sidebar"),
    ensureDefaultShellWidgets(userId, "top_chrome"),
    ensureDefaultShellWidgets(userId, "user_shell"),
  ]);

  return { ok: true as const };
}

export async function getCurrentUserProfile() {
  const userId = await getUserId();
  return getCurrentUserProfileRecord(userId);
}

export async function updateCurrentUserProfile(input: {
  displayName: string;
  avatarStyle: string;
}) {
  const userId = await getUserId();
  return updateCurrentUserProfileRecord({
    userId,
    displayName: input.displayName,
    avatarStyle: input.avatarStyle,
  });
}

export async function resendCurrentUserVerificationEmail() {
  const userId = await getUserId();
  const profile = await getCurrentUserProfileRecord(userId);

  if (profile.emailVerifiedAt) {
    return { ok: true as const };
  }

  await assertRateLimit({
    scope: "auth_verify_email",
    identifier: `verify|${profile.email}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
    blockMs: 30 * 60 * 1000,
  });

  await issueEmailVerification(userId, profile.email);
  return { ok: true as const };
}

export async function requestCurrentUserPasswordReset() {
  const userId = await getUserId();
  const profile = await getCurrentUserProfileRecord(userId);
  const resetUser = await getUserForPasswordReset(profile.email);

  if (!resetUser) {
    return { ok: true as const };
  }

  await assertRateLimit({
    scope: "auth_password_reset_request",
    identifier: `password-reset|${profile.email}`,
    limit: 5,
    windowMs: 15 * 60 * 1000,
    blockMs: 30 * 60 * 1000,
  });

  await issuePasswordReset(resetUser.id, resetUser.email);
  return { ok: true as const };
}

export async function changeCurrentUserPassword(input: {
  currentPassword: string;
  nextPassword: string;
  confirmPassword: string;
}) {
  const userId = await getUserId();

  if (input.nextPassword !== input.confirmPassword) {
    return {
      ok: false as const,
      message: "Passwords must match.",
      fieldErrors: {
        confirmPassword: "Passwords must match.",
      },
    };
  }

  await assertRateLimit({
    scope: "auth_password_change",
    identifier: `password-change|${userId}`,
    limit: 10,
    windowMs: 15 * 60 * 1000,
    blockMs: 30 * 60 * 1000,
  });

  const result = await changeCurrentUserPasswordRecord({
    userId,
    currentPassword: input.currentPassword,
    nextPassword: input.nextPassword,
  });

  if (!result.ok) {
    return {
      ok: false as const,
      message: result.message,
      fieldErrors:
        result.code === "invalid_current_password"
          ? { currentPassword: result.message }
          : result.code === "invalid_password"
            ? { nextPassword: result.message }
            : {},
    };
  }

  return {
    ok: true as const,
    message: "Password updated.",
    fieldErrors: {},
  };
}

export async function updateLeftSidebarShellState(partialState: Partial<LeftSidebarShellInstance["state"]>) {
  if (process.env.E2E_TEST_MODE === "1") {
    return { id: null, skipped: true as const, state: partialState };
  }

  const userId = await getUserId();
  await ensureUserShellInstance(userId, "left_sidebar");

  const { rows } = await pool.query(
    `
      UPDATE shell_instances si
      SET
        state = COALESCE(si.state, '{}'::jsonb) || $2::jsonb,
        updated_at = NOW()
      FROM shell_definitions sd
      WHERE sd.id = si.definition_id
        AND sd.slug = 'left_sidebar'
        AND si.owner_type = 'user'
        AND si.owner_id = $1
      RETURNING si.id
    `,
    [userId, JSON.stringify(partialState)]
  );

  return rows[0];
}

export async function reorderShellWidgetPlacements(
  shellInstanceId: string,
  orderedPlacementIds: string[]
) {
  const userId = await getUserId();

  if (orderedPlacementIds.length === 0) {
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const ownership = await client.query(
      `
        SELECT si.id
        FROM shell_instances si
        WHERE si.id = $1
          AND si.owner_type = 'user'
          AND si.owner_id = $2
        LIMIT 1
      `,
      [shellInstanceId, userId]
    );

    if (ownership.rowCount === 0) {
      throw new Error("Shell instance not found.");
    }

    await client.query(
      `
        UPDATE widget_placements
        SET
          position = position + 1000,
          updated_at = NOW()
        WHERE shell_instance_id = $1
          AND id = ANY($2::uuid[])
      `,
      [shellInstanceId, orderedPlacementIds]
    );

    for (const [position, placementId] of orderedPlacementIds.entries()) {
      await client.query(
        `
          UPDATE widget_placements
          SET
            position = $3,
            updated_at = NOW()
          WHERE shell_instance_id = $1
            AND id = $2::uuid
        `,
        [shellInstanceId, placementId, position]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

function mapEntityTable(entityType: WidgetEntityType) {
  if (entityType === "pin") {
    return { table: "pins", geometryKind: "point" as const };
  }

  if (entityType === "trace") {
    return { table: "traces", geometryKind: "line" as const };
  }

  return { table: "areas", geometryKind: "polygon" as const };
}

async function getEntityContainerId(
  client: PoolClient,
  entityType: WidgetEntityType,
  entityId: string,
  userId: string
) {
  const { table } = mapEntityTable(entityType);
  const { rows } = await client.query<{ container_id: string | null }>(
    `
      SELECT container_id
      FROM ${table}
      WHERE id = $1::uuid
        AND user_id::text = $2::text
      LIMIT 1
    `,
    [entityId, userId]
  );

  return rows[0]?.container_id ?? null;
}

async function upsertEntityDetails(
  client: PoolClient,
  params: {
    entityContainerId: string;
    userId: string;
    title?: string | null;
    description?: string | null;
  }
) {
  const normalizedTitle = params.title?.trim() || null;
  const normalizedDescription = params.description ?? "";

  const { rows } = await client.query<{ title: string | null; description: string }>(
    `
      INSERT INTO entity_details (entity_container_id, user_id, title, description, updated_at)
      VALUES ($1::uuid, $2, $3, $4, NOW())
      ON CONFLICT (entity_container_id)
      DO UPDATE
      SET title = EXCLUDED.title,
          description = EXCLUDED.description,
          updated_at = NOW()
      RETURNING title, description
    `,
    [params.entityContainerId, params.userId, normalizedTitle, normalizedDescription]
  );

  return rows[0] ?? { title: normalizedTitle, description: normalizedDescription };
}

async function getEntityMediaItemsByContainerId(
  client: PoolClient,
  entityContainerId: string,
  userId: string
) {
  const { rows } = await client.query<{
    id: string;
    storage_key: string;
    public_url: string;
    caption: string | null;
    position: number;
  }>(
    `
      SELECT id, storage_key, public_url, caption, position
      FROM entity_media_items
      WHERE entity_container_id = $1::uuid
        AND user_id = $2
      ORDER BY position ASC, created_at ASC
    `,
    [entityContainerId, userId]
  );

  return rows.map((row) => ({
    id: row.id,
    storageKey: row.storage_key,
    publicUrl: row.public_url,
    caption: row.caption,
    position: row.position,
  }));
}

async function syncLegacyPinImageFromMedia(
  client: PoolClient,
  pinId: string,
  userId: string,
  imageUrlOverride?: string | null
) {
  const nextImageUrl =
    imageUrlOverride !== undefined
      ? imageUrlOverride
      : (
          await client.query<{ public_url: string | null }>(
            `
              SELECT emi.public_url
              FROM pins p
              INNER JOIN entity_media_items emi ON emi.entity_container_id = p.container_id
              WHERE p.id = $1::uuid
                AND p.user_id = $2
              ORDER BY emi.position ASC, emi.created_at ASC
              LIMIT 1
            `,
            [pinId, userId]
          )
        ).rows[0]?.public_url ?? null;

  await client.query(
    `
      UPDATE pins
      SET image_url = $1
      WHERE id = $2::uuid
        AND user_id = $3
    `,
    [nextImageUrl, pinId, userId]
  );
}

async function createEntityContainerRecord(
  client: PoolClient,
  params: {
    entityType: WidgetEntityType;
    geometryKind: "point" | "line" | "polygon";
    collectionId?: string | null;
    userId: string;
    sourcePayload: Record<string, unknown>;
  }
) {
  const { rows } = await client.query(
    `
      INSERT INTO entity_containers (
        entity_type,
        geometry_kind,
        collection_id,
        status,
        source_payload,
        user_id
      )
      VALUES ($1, $2, $3, 'active', $4::jsonb, $5)
      RETURNING id
    `,
    [
      params.entityType,
      params.geometryKind,
      params.collectionId || null,
      JSON.stringify(params.sourcePayload),
      params.userId,
    ]
  );

  return rows[0].id as string;
}

// --- MEDIA UPLOADER ---
export async function uploadImage(formData: FormData) {
  const userId = await getUserId(); // Verify auth before allowing file uploads
  await assertRateLimit({
    scope: "media_upload",
    identifier: userId,
    limit: 20,
    windowMs: 10 * 60 * 1000,
    blockMs: 10 * 60 * 1000,
  });

  const file = formData.get('file') as File;
  validateImageUpload(file);
  return writeUpload(file);
}

export interface EntityMediaItemRecord {
  id: string;
  storageKey: string;
  publicUrl: string;
  caption: string | null;
  position: number;
}

export interface EntityResourceLinkRecord {
  id: string;
  label: string | null;
  url: string;
  position: number;
  preview: {
    resolvedUrl: string | null;
    hostname: string | null;
    siteName: string | null;
    title: string | null;
    description: string | null;
    imageUrl: string | null;
    faviconUrl: string | null;
    status: "pending" | "ready" | "error";
    errorMessage: string | null;
    fetchedAt: string | null;
  } | null;
}

export interface EntityStoryEntryRecord {
  id: string;
  title: string | null;
  bodyMarkdown: string;
  position: number;
  publishedAt: string | null;
}

export interface EntityNearbyPinRecord {
  id: string;
  containerId: string;
  title: string;
  collectionId: string | null;
  collectionName: string | null;
  collectionColor: string | null;
  imageUrl: string | null;
  rating: number | null;
  distanceMeters: number;
  coordinates: { lng: number; lat: number };
}

// --- COLLECTIONS ---
export async function getCollections(type?: string) {
  const userId = await getUserId();
  const traceFallbackCollectionIdSql = `
    (
      SELECT c2.id
      FROM collections c2
      WHERE c2.user_id = $1
        AND c2.type = 'trace'
      ORDER BY c2.created_at ASC
      LIMIT 1
    )
  `;
  const areaFallbackCollectionIdSql = `
    (
      SELECT c2.id
      FROM collections c2
      WHERE c2.user_id = $1
        AND c2.type = 'area'
      ORDER BY c2.created_at ASC
      LIMIT 1
    )
  `;
  const selectQuery = `
    SELECT
      c.*,
      CASE
        WHEN c.type = 'trace' THEN (
          SELECT COUNT(*)::int
          FROM traces t
          LEFT JOIN entity_containers ec ON ec.id = t.container_id
          WHERE COALESCE(
            t.collection_id,
            ec.collection_id,
            CASE
              WHEN (
                SELECT COUNT(*)
                FROM collections c2
                WHERE c2.user_id = $1
                  AND c2.type = 'trace'
              ) = 1 THEN ${traceFallbackCollectionIdSql}
              ELSE NULL
            END
          ) = c.id
            AND t.user_id = $1
            AND COALESCE(ec.status, 'active') = 'active'
        )
        WHEN c.type = 'area' THEN (
          SELECT COUNT(*)::int
          FROM areas a
          LEFT JOIN entity_containers ec ON ec.id = a.container_id
          WHERE COALESCE(
            a.collection_id,
            ec.collection_id,
            CASE
              WHEN (
                SELECT COUNT(*)
                FROM collections c2
                WHERE c2.user_id = $1
                  AND c2.type = 'area'
              ) = 1 THEN ${areaFallbackCollectionIdSql}
              ELSE NULL
            END
          ) = c.id
            AND a.user_id = $1
            AND COALESCE(ec.status, 'active') = 'active'
        )
        ELSE (
          SELECT COUNT(*)::int
          FROM pins p
          LEFT JOIN entity_containers ec ON ec.id = p.container_id
          WHERE COALESCE(p.collection_id, ec.collection_id) = c.id
            AND p.user_id = $1
            AND COALESCE(ec.status, 'active') = 'active'
        )
      END AS "itemCount"
    FROM collections c
  `;

  if (type) {
    const { rows } = await pool.query(
      `${selectQuery} WHERE c.user_id::text = $1::text AND c.type = $2 ORDER BY c.created_at DESC`,
      [userId, type]
    );
    return rows;
  }
  const { rows } = await pool.query(
    `${selectQuery} WHERE c.user_id::text = $1::text ORDER BY c.created_at DESC`,
    [userId]
  );
  return rows;
}

export async function createCollection(name: string, color: string, icon: string, type: string = 'pin') {
  const userId = await getUserId();
  const { rows } = await pool.query(
    `INSERT INTO collections (name, color, icon, user_id, type) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, color, icon, type`,
    [name, color, icon || '📍', userId, type]
  );
  return { ...rows[0], itemCount: 0 };
}

export async function updateCollection(id: string, name: string, color: string, icon: string) {
  const userId = await getUserId();
  const { rows } = await pool.query(
    `UPDATE collections SET name = $1, color = $2, icon = $3 WHERE id = $4 AND user_id = $5 RETURNING id`,
    [name, color, icon || '📍', id, userId]
  );
  return rows[0];
}

export async function deleteCollection(id: string) {
  const userId = await getUserId();
  const client = await pool.connect();
  const pinImagesToDelete: string[] = [];

  try {
    await client.query("BEGIN");
    const { rows: pinRows } = await client.query(
      `SELECT id, image_url, container_id FROM pins WHERE collection_id = $1 AND user_id = $2`,
      [id, userId]
    );
    const { rows: traceRows } = await client.query(
      `SELECT id, container_id FROM traces WHERE collection_id = $1 AND user_id = $2`,
      [id, userId]
    );
    const { rows: areaRows } = await client.query(
      `SELECT id, container_id FROM areas WHERE collection_id = $1 AND user_id = $2`,
      [id, userId]
    );

    pinImagesToDelete.push(
      ...pinRows
        .map((row: { image_url: string | null }) => row.image_url)
        .filter((value: string | null): value is string => Boolean(value))
    );

    const pinIds = pinRows.map((row: { id: string }) => row.id);
    const traceIds = traceRows.map((row: { id: string }) => row.id);
    const areaIds = areaRows.map((row: { id: string }) => row.id);
    const containerIds = [
      ...pinRows.map((row: { container_id?: string | null }) => row.container_id).filter(Boolean),
      ...traceRows.map((row: { container_id?: string | null }) => row.container_id).filter(Boolean),
      ...areaRows.map((row: { container_id?: string | null }) => row.container_id).filter(Boolean),
    ] as string[];

    if (containerIds.length > 0) {
      const { rows: mediaRows } = await client.query<{ public_url: string }>(
        `
          SELECT DISTINCT public_url
          FROM entity_media_items
          WHERE user_id = $1
            AND entity_container_id = ANY($2::uuid[])
        `,
        [userId, containerIds]
      );

      pinImagesToDelete.push(...mediaRows.map((row) => row.public_url));
    }

    if (pinIds.length > 0) {
      await client.query(
        `DELETE FROM widget_instances WHERE user_id = $1 AND layer = 'entity' AND entity_type = 'pin' AND entity_id = ANY($2::uuid[])`,
        [userId, pinIds]
      );
    }

    if (traceIds.length > 0) {
      await client.query(
        `DELETE FROM widget_instances WHERE user_id = $1 AND layer = 'entity' AND entity_type = 'trace' AND entity_id = ANY($2::uuid[])`,
        [userId, traceIds]
      );
    }

    if (areaIds.length > 0) {
      await client.query(
        `DELETE FROM widget_instances WHERE user_id = $1 AND layer = 'entity' AND entity_type = 'area' AND entity_id = ANY($2::uuid[])`,
        [userId, areaIds]
      );
    }

    if (containerIds.length > 0) {
      await client.query(
        `DELETE FROM entity_containers WHERE user_id = $1 AND id = ANY($2::uuid[])`,
        [userId, containerIds]
      );
    }

    await client.query(`DELETE FROM pins WHERE collection_id = $1 AND user_id = $2`, [id, userId]);
    await client.query(`DELETE FROM traces WHERE collection_id = $1 AND user_id = $2`, [id, userId]);
    await client.query(`DELETE FROM areas WHERE collection_id = $1 AND user_id = $2`, [id, userId]);
    await client.query(`DELETE FROM collections WHERE id = $1 AND user_id = $2`, [id, userId]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  await Promise.all(pinImagesToDelete.map((imageUrl) => deleteUploadFromUrl(imageUrl)));

  return true;
}

// --- PINS / MEMORIES ---
export async function getPins() {
  const userId = await getUserId();
  const { rows } = await pool.query(`
    SELECT p.id, p.container_id, COALESCE(p.collection_id, ec.collection_id) as collection_id,
           COALESCE(ed.title, p.name) as name,
           COALESCE(NULLIF(ed.description, ''), p.note) as note,
           COALESCE(media.public_url, p.image_url) as image_url,
           c.color as "collectionColor",
           c.icon as "collectionIcon",
           ST_AsGeoJSON(p.location)::json as location
    FROM pins p
    LEFT JOIN entity_containers ec ON ec.id = p.container_id
    LEFT JOIN entity_details ed ON ed.entity_container_id = p.container_id
    LEFT JOIN LATERAL (
      SELECT emi.public_url
      FROM entity_media_items emi
      WHERE emi.entity_container_id = p.container_id
        AND emi.user_id = p.user_id::text
      ORDER BY emi.position ASC, emi.created_at ASC
      LIMIT 1
    ) media ON TRUE
    LEFT JOIN collections c ON c.id = COALESCE(p.collection_id, ec.collection_id)
    WHERE p.user_id::text = $1::text
      AND COALESCE(ec.status, 'active') = 'active'
  `, [userId]);
  return rows;
}

export async function savePin(lng: number, lat: number, collectionId: string, name?: string) {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const containerId = await createEntityContainerRecord(client, {
      entityType: "pin",
      geometryKind: "point",
      collectionId,
      userId,
      sourcePayload: {
        source: "map_click",
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        coordinates: {
          lng,
          lat,
        },
        initialTitle: name || null,
      },
    });

    await upsertEntityDetails(client, {
      entityContainerId: containerId,
      userId,
      title: name || null,
      description: "",
    });

    const query = `
      INSERT INTO pins (container_id, collection_id, name, location, user_id) 
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6)
      RETURNING id, container_id
    `;
    const { rows } = await client.query(query, [containerId, collectionId, name || null, lng, lat, userId]);
    await client.query("COMMIT");
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updatePinMemory(id: string, note: string, imageUrl: string | null) {
  const userId = await getUserId();
  // TEMP(tech-debt): note/image still live directly on pins during the transition
  // to entity containers + enrichment tables.
  const { rows } = await pool.query(
    `UPDATE pins SET note = $1, image_url = $2 WHERE id = $3 AND user_id = $4 RETURNING id`,
    [note, imageUrl, id, userId]
  );
  return rows[0];
}

export async function updatePinDetails(id: string, name: string, note: string, imageUrl: string | null) {
  return updateEntityInfo("pin", id, name, note, imageUrl);
}

export async function deletePin(id: string) {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT container_id FROM pins WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [id, userId]
    );
    const containerId = rows[0]?.container_id ?? null;

    if (containerId) {
      await client.query(
        `
          UPDATE entity_containers
          SET status = 'archived',
              archived_at = NOW(),
              purge_after = NOW() + INTERVAL '30 days',
              updated_at = NOW()
          WHERE id = $1::uuid
            AND user_id = $2
        `,
        [containerId, userId]
      );
    } else {
      // TEMP(tech-debt): legacy pin rows without a container still fall back to hard delete.
      await client.query(`DELETE FROM pins WHERE id = $1 AND user_id = $2`, [id, userId]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  return true;
}


// --- TRACES ---
export async function getTraces() {
  const userId = await getUserId();
  const traceFallbackCollectionIdSql = `
    CASE
      WHEN (
        SELECT COUNT(*)
        FROM collections c2
        WHERE c2.user_id = t.user_id
          AND c2.type = 'trace'
      ) = 1 THEN (
        SELECT c2.id
        FROM collections c2
        WHERE c2.user_id = t.user_id
          AND c2.type = 'trace'
        ORDER BY c2.created_at ASC
        LIMIT 1
      )
      ELSE NULL
    END
  `;
  const { rows } = await pool.query(`
    SELECT t.id, t.container_id, COALESCE(ed.title, t.name) as name, t.color,
           COALESCE(
             t.collection_id,
             ec.collection_id,
             ${traceFallbackCollectionIdSql}
           ) as collection_id,
           c.color as "collectionColor",
           ST_AsGeoJSON(t.path)::json as path,
           COALESCE(
             (
               SELECT json_agg(
                 json_build_object(
                   'id', tb.id,
                   'path', ST_AsGeoJSON(tb.path)::json
                 )
                 ORDER BY tb.created_at ASC
               )
               FROM trace_branches tb
               WHERE tb.trace_id = t.id
                 AND tb.user_id = t.user_id
             ),
             '[]'::json
           ) as branches
    FROM traces t
    LEFT JOIN entity_containers ec ON ec.id = t.container_id
    LEFT JOIN entity_details ed ON ed.entity_container_id = t.container_id
    LEFT JOIN collections c ON c.id = COALESCE(
      t.collection_id,
      ec.collection_id,
      ${traceFallbackCollectionIdSql}
    )
    WHERE t.user_id = $1
      AND COALESCE(ec.status, 'active') = 'active'
  `, [userId]);
  return rows;
}

const TRACE_MERGE_THRESHOLD_METERS = 3;

type TraceMergeMatchKind =
  | "draft_start_to_existing_start"
  | "draft_start_to_existing_end"
  | "draft_end_to_existing_start"
  | "draft_end_to_existing_end";

export interface TraceMergeCandidateRecord {
  traceId: string;
  containerId: string | null;
  title: string;
  collectionId: string | null;
  distanceMeters: number;
  matchKind: TraceMergeMatchKind;
}

type TraceEndpointKind = "start" | "end";

function reverseTraceCoordinates(coordinates: [number, number][]) {
  return [...coordinates].reverse();
}

function areCoordinatesClose(
  left: [number, number] | undefined,
  right: [number, number] | undefined,
  tolerance = 0.0000001
) {
  if (!left || !right) {
    return false;
  }

  return Math.abs(left[0] - right[0]) <= tolerance && Math.abs(left[1] - right[1]) <= tolerance;
}

function stitchTraceCoordinates(
  leading: [number, number][],
  trailing: [number, number][]
) {
  if (leading.length === 0) {
    return trailing;
  }

  if (trailing.length === 0) {
    return leading;
  }

  const seamLeading = leading[leading.length - 1];
  const seamTrailing = trailing[0];

  if (areCoordinatesClose(seamLeading, seamTrailing)) {
    return [...leading, ...trailing.slice(1)];
  }

  return [...leading, ...trailing];
}

function buildMergedTraceCoordinates(
  existingCoordinates: [number, number][],
  draftCoordinates: [number, number][],
  matchKind: TraceMergeMatchKind
) {
  switch (matchKind) {
    case "draft_start_to_existing_start":
      return stitchTraceCoordinates(reverseTraceCoordinates(draftCoordinates), existingCoordinates);
    case "draft_start_to_existing_end":
      return stitchTraceCoordinates(existingCoordinates, draftCoordinates);
    case "draft_end_to_existing_start":
      return stitchTraceCoordinates(draftCoordinates, existingCoordinates);
    case "draft_end_to_existing_end":
      return stitchTraceCoordinates(draftCoordinates, reverseTraceCoordinates(existingCoordinates));
    default:
      return stitchTraceCoordinates(existingCoordinates, draftCoordinates);
  }
}

function coordinatesToLineStringWkt(coordinates: [number, number][]) {
  const wktPoints = coordinates.map((coordinate) => `${coordinate[0]} ${coordinate[1]}`).join(", ");
  return `LINESTRING(${wktPoints})`;
}

async function resolveTraceMergeCandidate(
  userId: string,
  coordinates: [number, number][],
  collectionId?: string
) {
  if (!collectionId || coordinates.length < 2) {
    return null;
  }

  const draftStart = coordinates[0];
  const draftEnd = coordinates[coordinates.length - 1];

  const { rows } = await pool.query(
    `
      WITH draft AS (
        SELECT
          ST_SetSRID(ST_MakePoint($1, $2), 4326) AS draft_start,
          ST_SetSRID(ST_MakePoint($3, $4), 4326) AS draft_end
      )
      SELECT
        t.id AS "traceId",
        t.container_id AS "containerId",
        COALESCE(ed.title, t.name, 'Untitled Path') AS title,
        COALESCE(t.collection_id, ec.collection_id)::text AS "collectionId",
        ST_AsGeoJSON(t.path)::json AS path,
        LEAST(
          ST_DistanceSphere(ST_StartPoint(t.path), draft.draft_start),
          ST_DistanceSphere(ST_EndPoint(t.path), draft.draft_start),
          ST_DistanceSphere(ST_StartPoint(t.path), draft.draft_end),
          ST_DistanceSphere(ST_EndPoint(t.path), draft.draft_end)
        ) AS "distanceMeters",
        CASE
          WHEN ST_DistanceSphere(ST_StartPoint(t.path), draft.draft_start) <= ST_DistanceSphere(ST_EndPoint(t.path), draft.draft_start)
            AND ST_DistanceSphere(ST_StartPoint(t.path), draft.draft_start) <= ST_DistanceSphere(ST_StartPoint(t.path), draft.draft_end)
            AND ST_DistanceSphere(ST_StartPoint(t.path), draft.draft_start) <= ST_DistanceSphere(ST_EndPoint(t.path), draft.draft_end)
            THEN 'draft_start_to_existing_start'
          WHEN ST_DistanceSphere(ST_EndPoint(t.path), draft.draft_start) <= ST_DistanceSphere(ST_StartPoint(t.path), draft.draft_start)
            AND ST_DistanceSphere(ST_EndPoint(t.path), draft.draft_start) <= ST_DistanceSphere(ST_StartPoint(t.path), draft.draft_end)
            AND ST_DistanceSphere(ST_EndPoint(t.path), draft.draft_start) <= ST_DistanceSphere(ST_EndPoint(t.path), draft.draft_end)
            THEN 'draft_start_to_existing_end'
          WHEN ST_DistanceSphere(ST_StartPoint(t.path), draft.draft_end) <= ST_DistanceSphere(ST_StartPoint(t.path), draft.draft_start)
            AND ST_DistanceSphere(ST_StartPoint(t.path), draft.draft_end) <= ST_DistanceSphere(ST_EndPoint(t.path), draft.draft_start)
            AND ST_DistanceSphere(ST_StartPoint(t.path), draft.draft_end) <= ST_DistanceSphere(ST_EndPoint(t.path), draft.draft_end)
            THEN 'draft_end_to_existing_start'
          ELSE 'draft_end_to_existing_end'
        END AS "matchKind"
      FROM traces t
      LEFT JOIN entity_containers ec ON ec.id = t.container_id
      LEFT JOIN entity_details ed ON ed.entity_container_id = t.container_id
      CROSS JOIN draft
      WHERE t.user_id::text = $5::text
        AND COALESCE(ec.status, 'active') = 'active'
        AND COALESCE(t.collection_id, ec.collection_id)::text = $6::text
        AND (
          ST_DWithin(ST_StartPoint(t.path)::geography, draft.draft_start::geography, $7) OR
          ST_DWithin(ST_EndPoint(t.path)::geography, draft.draft_start::geography, $7) OR
          ST_DWithin(ST_StartPoint(t.path)::geography, draft.draft_end::geography, $7) OR
          ST_DWithin(ST_EndPoint(t.path)::geography, draft.draft_end::geography, $7)
        )
      ORDER BY "distanceMeters" ASC
      LIMIT 1
    `,
    [
      draftStart[0],
      draftStart[1],
      draftEnd[0],
      draftEnd[1],
      userId,
      collectionId,
      TRACE_MERGE_THRESHOLD_METERS,
    ]
  );

  const candidate = rows[0] as
    | (TraceMergeCandidateRecord & {
        path: { coordinates?: [number, number][] };
      })
    | undefined;

  if (!candidate || !Array.isArray(candidate.path?.coordinates) || candidate.path.coordinates.length < 2) {
    return null;
  }

  return {
    candidate: {
      traceId: candidate.traceId,
      containerId: candidate.containerId,
      title: candidate.title,
      collectionId: candidate.collectionId,
      distanceMeters: Number(candidate.distanceMeters),
      matchKind: candidate.matchKind,
    } satisfies TraceMergeCandidateRecord,
    existingCoordinates: candidate.path.coordinates,
  };
}

export async function previewTraceMerge(
  coordinates: [number, number][],
  collectionId?: string
) {
  const userId = await getUserId();
  const resolvedCandidate = await resolveTraceMergeCandidate(userId, coordinates, collectionId);

  return resolvedCandidate?.candidate ?? null;
}

export async function mergeTraceIntoExisting(
  existingTraceId: string,
  coordinates: [number, number][],
  collectionId?: string
) {
  const userId = await getUserId();
  const resolvedCandidate = await resolveTraceMergeCandidate(userId, coordinates, collectionId);

  if (!resolvedCandidate || resolvedCandidate.candidate.traceId !== existingTraceId) {
    throw new Error("The selected path is no longer mergeable. Try again from the latest map state.");
  }

  const mergedCoordinates = buildMergedTraceCoordinates(
    resolvedCandidate.existingCoordinates,
    coordinates,
    resolvedCandidate.candidate.matchKind
  );

  const mergedWkt = coordinatesToLineStringWkt(mergedCoordinates);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        UPDATE traces
        SET path = ST_SetSRID($1::geometry, 4326),
            collection_id = COALESCE($2::uuid, collection_id)
        WHERE id = $3::uuid
          AND user_id::text = $4::text
      `,
      [mergedWkt, collectionId ?? null, existingTraceId, userId]
    );

    if (resolvedCandidate.candidate.containerId) {
      await client.query(
        `
          UPDATE entity_containers
          SET collection_id = COALESCE($1::uuid, collection_id),
              source_payload = jsonb_set(
                jsonb_set(
                  COALESCE(source_payload, '{}'::jsonb),
                  '{coordinates}',
                  to_jsonb($2::json),
                  true
                ),
                '{geometry,coordinates}',
                to_jsonb($2::json),
                true
              ),
              updated_at = NOW()
          WHERE id = $3::uuid
            AND user_id::text = $4::text
        `,
        [collectionId ?? null, JSON.stringify(mergedCoordinates), resolvedCandidate.candidate.containerId, userId]
      );
    }

    await client.query("COMMIT");

    return {
      id: existingTraceId,
      mergedCoordinates,
      mergedIntoExisting: true,
      mergedTraceTitle: resolvedCandidate.candidate.title,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function mergeTraceIntoEndpoint(
  existingTraceId: string,
  coordinates: [number, number][],
  targetEndpoint: TraceEndpointKind
) {
  const userId = await getUserId();
  const { rows } = await pool.query(
    `
      SELECT
        t.id,
        t.container_id AS "containerId",
        COALESCE(t.collection_id, ec.collection_id)::text AS "collectionId",
        COALESCE(ed.title, t.name, 'Untitled Path') AS title,
        ST_AsGeoJSON(t.path)::json AS path
      FROM traces t
      LEFT JOIN entity_containers ec ON ec.id = t.container_id
      LEFT JOIN entity_details ed ON ed.entity_container_id = t.container_id
      WHERE t.id = $1::uuid
        AND t.user_id::text = $2::text
        AND COALESCE(ec.status, 'active') = 'active'
      LIMIT 1
    `,
    [existingTraceId, userId]
  );

  const existingTrace = rows[0] as
    | {
        containerId: string | null;
        collectionId: string | null;
        title: string;
        path: { coordinates?: [number, number][] };
      }
    | undefined;

  if (!existingTrace || !Array.isArray(existingTrace.path?.coordinates) || existingTrace.path.coordinates.length < 2) {
    throw new Error("The selected path could not be loaded for merging.");
  }

  const mergedCoordinates =
    targetEndpoint === "start"
      ? stitchTraceCoordinates(coordinates, existingTrace.path.coordinates)
      : stitchTraceCoordinates(coordinates, reverseTraceCoordinates(existingTrace.path.coordinates));

  const mergedWkt = coordinatesToLineStringWkt(mergedCoordinates);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `
        UPDATE traces
        SET path = ST_SetSRID($1::geometry, 4326)
        WHERE id = $2::uuid
          AND user_id::text = $3::text
      `,
      [mergedWkt, existingTraceId, userId]
    );

    if (existingTrace.containerId) {
      await client.query(
        `
          UPDATE entity_containers
          SET source_payload = jsonb_set(
                jsonb_set(
                  COALESCE(source_payload, '{}'::jsonb),
                  '{coordinates}',
                  to_jsonb($1::json),
                  true
                ),
                '{geometry,coordinates}',
                to_jsonb($1::json),
                true
              ),
              updated_at = NOW()
          WHERE id = $2::uuid
            AND user_id::text = $3::text
        `,
        [JSON.stringify(mergedCoordinates), existingTrace.containerId, userId]
      );
    }

    await client.query("COMMIT");

    return {
      id: existingTraceId,
      mergedCoordinates,
      mergedIntoExisting: true,
      mergedTraceTitle: existingTrace.title,
      collectionId: existingTrace.collectionId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

const TRACE_BRANCH_ATTACHMENT_THRESHOLD_METERS = 30;

function squaredCoordinateDistance(left: [number, number], right: [number, number]) {
  const lng = left[0] - right[0];
  const lat = left[1] - right[1];
  return lng * lng + lat * lat;
}

export async function attachTraceBranch(
  existingTraceId: string,
  coordinates: [number, number][],
  requestedAttachment: [number, number]
) {
  if (coordinates.length < 2) {
    throw new Error("A branch needs at least two points.");
  }

  const userId = await getUserId();
  const { rows } = await pool.query(
    `
      WITH network_segments AS (
        SELECT t.path
        FROM traces t
        LEFT JOIN entity_containers ec ON ec.id = t.container_id
        WHERE t.id = $1::uuid
          AND t.user_id::text = $2::text
          AND COALESCE(ec.status, 'active') = 'active'

        UNION ALL

        SELECT tb.path
        FROM trace_branches tb
        WHERE tb.trace_id = $1::uuid
          AND tb.user_id::text = $2::text
      ),
      requested_point AS (
        SELECT ST_SetSRID(ST_MakePoint($3, $4), 4326) AS point
      )
      SELECT
        ST_X(ST_ClosestPoint(network_segments.path, requested_point.point)) AS lng,
        ST_Y(ST_ClosestPoint(network_segments.path, requested_point.point)) AS lat,
        ST_DistanceSphere(
          ST_ClosestPoint(network_segments.path, requested_point.point),
          requested_point.point
        ) AS "distanceMeters"
      FROM network_segments
      CROSS JOIN requested_point
      ORDER BY "distanceMeters" ASC
      LIMIT 1
    `,
    [existingTraceId, userId, requestedAttachment[0], requestedAttachment[1]]
  );

  const closest = rows[0] as
    | { lng: number | string; lat: number | string; distanceMeters: number | string }
    | undefined;

  if (!closest || Number(closest.distanceMeters) > TRACE_BRANCH_ATTACHMENT_THRESHOLD_METERS) {
    throw new Error("The selected point is no longer close enough to this path.");
  }

  const attachment: [number, number] = [Number(closest.lng), Number(closest.lat)];
  const firstDistance = squaredCoordinateDistance(coordinates[0], requestedAttachment);
  const lastDistance = squaredCoordinateDistance(coordinates[coordinates.length - 1], requestedAttachment);
  const orientedCoordinates = firstDistance <= lastDistance ? [...coordinates] : [...coordinates].reverse();
  orientedCoordinates[0] = attachment;

  const branchWkt = coordinatesToLineStringWkt(orientedCoordinates);
  const { rows: insertedRows } = await pool.query(
    `
      INSERT INTO trace_branches (trace_id, path, user_id)
      SELECT t.id, ST_SetSRID($1::geometry, 4326), t.user_id
      FROM traces t
      LEFT JOIN entity_containers ec ON ec.id = t.container_id
      WHERE t.id = $2::uuid
        AND t.user_id::text = $3::text
        AND COALESCE(ec.status, 'active') = 'active'
      RETURNING id
    `,
    [branchWkt, existingTraceId, userId]
  );

  if (!insertedRows[0]) {
    throw new Error("The selected path could not be loaded for branching.");
  }

  return {
    id: insertedRows[0].id as string,
    traceId: existingTraceId,
    coordinates: orientedCoordinates,
  };
}

export async function saveTrace(coordinates: [number, number][], color: string, collectionId?: string) {
  const userId = await getUserId();
  const wkt = coordinatesToLineStringWkt(coordinates);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const containerId = await createEntityContainerRecord(client, {
      entityType: "trace",
      geometryKind: "line",
      collectionId: collectionId || null,
      userId,
      sourcePayload: {
        source: "map_path_authoring",
        geometry: {
          type: "LineString",
          coordinates,
        },
        coordinates,
        color,
      },
    });

    await upsertEntityDetails(client, {
      entityContainerId: containerId,
      userId,
      title: null,
      description: "",
    });

    const { rows } = await client.query(
      `INSERT INTO traces (container_id, path, color, user_id, collection_id) VALUES ($1, ST_SetSRID($2::geometry, 4326), $3, $4, $5) RETURNING id, container_id`,
      [containerId, wkt, color, userId, collectionId || null]
    );
    await client.query("COMMIT");
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateTrace(id: string, coordinates: [number, number][]) {
  const userId = await getUserId();
  const wkt = coordinatesToLineStringWkt(coordinates);
  const { rows } = await pool.query(`UPDATE traces SET path = ST_SetSRID($1::geometry, 4326) WHERE id = $2 AND user_id = $3 RETURNING id`, [wkt, id, userId]);
  return rows[0];
}

export async function deleteTrace(id: string) {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT container_id FROM traces WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [id, userId]
    );
    const containerId = rows[0]?.container_id ?? null;

    if (containerId) {
      await client.query(
        `
          UPDATE entity_containers
          SET status = 'archived',
              archived_at = NOW(),
              purge_after = NOW() + INTERVAL '30 days',
              updated_at = NOW()
          WHERE id = $1::uuid
            AND user_id = $2
        `,
        [containerId, userId]
      );
    } else {
      // TEMP(tech-debt): legacy trace rows without a container still fall back to hard delete.
      await client.query(`DELETE FROM traces WHERE id = $1 AND user_id = $2`, [id, userId]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  return true;
}


// ------ AREAS (POLYGONS) ------
export async function getAreas() {
  const userId = await getUserId();
  const areaFallbackCollectionIdSql = `
    CASE
      WHEN (
        SELECT COUNT(*)
        FROM collections c2
        WHERE c2.user_id = a.user_id
          AND c2.type = 'area'
      ) = 1 THEN (
        SELECT c2.id
        FROM collections c2
        WHERE c2.user_id = a.user_id
          AND c2.type = 'area'
        ORDER BY c2.created_at ASC
        LIMIT 1
      )
      ELSE NULL
    END
  `;
  const { rows } = await pool.query(`
    SELECT a.id, a.container_id, COALESCE(ed.title, a.name) as name, a.color,
           COALESCE(
             a.collection_id,
             ec.collection_id,
             ${areaFallbackCollectionIdSql}
           ) as collection_id,
           c.color as "collectionColor",
           ST_AsGeoJSON(a.path)::json as path 
    FROM areas a
    LEFT JOIN entity_containers ec ON ec.id = a.container_id
    LEFT JOIN entity_details ed ON ed.entity_container_id = a.container_id
    LEFT JOIN collections c ON c.id = COALESCE(
      a.collection_id,
      ec.collection_id,
      ${areaFallbackCollectionIdSql}
    )
    WHERE a.user_id = $1
      AND COALESCE(ec.status, 'active') = 'active'
  `, [userId]);
  return rows;
}

export async function saveArea(coordinates: [number, number][], color: string, collectionId?: string) {
  const userId = await getUserId();
  const safeCoords = [...coordinates];
  if (safeCoords.length >= 3) {
    const first = safeCoords[0];
    const last = safeCoords[safeCoords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) safeCoords.push([...first]);
  }
  const wktPoints = safeCoords.map(c => `${c[0]} ${c[1]}`).join(', ');
  const wkt = `POLYGON((${wktPoints}))`;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const containerId = await createEntityContainerRecord(client, {
      entityType: "area",
      geometryKind: "polygon",
      collectionId: collectionId || null,
      userId,
      sourcePayload: {
        source: "map_area_authoring",
        geometry: {
          type: "Polygon",
          coordinates: [safeCoords],
        },
        coordinates: safeCoords,
        color,
      },
    });

    await upsertEntityDetails(client, {
      entityContainerId: containerId,
      userId,
      title: null,
      description: "",
    });

    const { rows } = await client.query(
      `INSERT INTO areas (container_id, path, color, user_id, collection_id) VALUES ($1, ST_SetSRID($2::geometry, 4326), $3, $4, $5) RETURNING id, container_id`,
      [containerId, wkt, color, userId, collectionId || null]
    );
    await client.query("COMMIT");
    return rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateArea(id: string, coordinates: [number, number][]) {
  const userId = await getUserId();
  const safeCoords = [...coordinates];
  if (safeCoords.length >= 3) {
    const first = safeCoords[0];
    const last = safeCoords[safeCoords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) safeCoords.push([...first]);
  }
  const wktPoints = safeCoords.map(c => `${c[0]} ${c[1]}`).join(', ');
  const wkt = `POLYGON((${wktPoints}))`;

  const { rows } = await pool.query(`UPDATE areas SET path = ST_SetSRID($1::geometry, 4326) WHERE id = $2 AND user_id = $3 RETURNING id`, [wkt, id, userId]);
  return rows[0];
}

export async function deleteArea(id: string) {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT container_id FROM areas WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [id, userId]
    );
    const containerId = rows[0]?.container_id ?? null;

    if (containerId) {
      await client.query(
        `
          UPDATE entity_containers
          SET status = 'archived',
              archived_at = NOW(),
              purge_after = NOW() + INTERVAL '30 days',
              updated_at = NOW()
          WHERE id = $1::uuid
            AND user_id = $2
        `,
        [containerId, userId]
      );
    } else {
      // TEMP(tech-debt): legacy area rows without a container still fall back to hard delete.
      await client.query(`DELETE FROM areas WHERE id = $1 AND user_id = $2`, [id, userId]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  return true;
}

export async function deleteEntity(entityType: WidgetEntityType, id: string) {
  switch (entityType) {
    case "pin":
      return deletePin(id);
    case "trace":
      return deleteTrace(id);
    case "area":
      return deleteArea(id);
    default: {
      const exhaustiveCheck: never = entityType;
      throw new Error(`Unsupported entity type: ${String(exhaustiveCheck)}`);
    }
  }
}

// --- WIDGETS ---
export async function getWidgetDefinitions(layer?: WidgetLayerType) {
  await ensureWidgetLibrarySeed();

  const query = layer
    ? `
        SELECT
          id,
          slug,
          name,
          layer,
          supported_entity_types as "supportedEntityTypes",
          component_key as "componentKey",
          default_config as "defaultConfig",
          is_system as "isSystem"
        FROM widget_definitions
        WHERE layer = $1
        ORDER BY is_system DESC, created_at ASC
      `
    : `
        SELECT
          id,
          slug,
          name,
          layer,
          supported_entity_types as "supportedEntityTypes",
          component_key as "componentKey",
          default_config as "defaultConfig",
          is_system as "isSystem"
        FROM widget_definitions
        ORDER BY is_system DESC, created_at ASC
      `;

  const { rows } = await pool.query(query, layer ? [layer] : []);
  return rows as WidgetDefinitionRecord[];
}

export interface WidgetLibraryCatalogRecord extends WidgetDefinitionRecord {
  nativeHost: WidgetHost;
  placementPolicy: WidgetPlacementPolicy;
  placedHosts: WidgetHost[];
  availableHosts: WidgetHost[];
  placementSummary: string;
  actionMode: WidgetPlacementActionMode;
  actionLabel: string;
  inUse: boolean;
  canAdd: boolean;
  disabledReason: string | null;
}

export async function getWidgetLibraryCatalog(
  entityType?: WidgetEntityType,
  entityId?: string
) {
  const userId = await getUserId();
  void entityId;

  const definitions = (await getWidgetDefinitions()).filter((definition) => {
    if (definition.componentKey === "shell_actions") {
      return false;
    }

    if (definition.layer !== "entity") {
      return true;
    }

    return sharedEntityWidgetComponentKeys.includes(
      definition.componentKey as (typeof sharedEntityWidgetComponentKeys)[number]
    );
  });

  const [shellUsage, globalUsage, entityUsage] = await Promise.all([
    pool.query(
      `
        SELECT
          wd.slug,
          si.owner_type as "ownerType",
          si.owner_id as "ownerId",
          sd.slug as "shellSlug"
        FROM widget_instances wi
        INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
        INNER JOIN widget_placements wp ON wp.widget_instance_id = wi.id
        INNER JOIN shell_instances si ON si.id = wp.shell_instance_id
        INNER JOIN shell_definitions sd ON sd.id = si.definition_id
        WHERE wi.user_id = $1
          AND wi.layer = 'shell'
      `,
      [userId]
    ),
    pool.query(
      `
        SELECT wd.slug
        FROM widget_instances wi
        INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
        WHERE wi.user_id = $1
          AND wi.layer = 'global'
      `,
      [userId]
    ),
    pool.query(
      `
        SELECT wd.slug
        FROM widget_instances wi
        INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
        WHERE wi.user_id = $1
          AND wi.layer = 'entity'
          AND wi.entity_type IS NULL
          AND wi.entity_id IS NULL
      `,
      [userId]
    ),
  ]);

  const shellUsedBySlug = new Map<string, WidgetHost[]>();

  for (const row of shellUsage.rows) {
    const host = mapShellPlacementHost(
      row.ownerType as string,
      row.ownerId as string,
      row.shellSlug as string
    );

    if (!host) {
      continue;
    }

    const existing = shellUsedBySlug.get(row.slug as string) ?? [];
    if (!existing.includes(host)) {
      shellUsedBySlug.set(row.slug as string, [...existing, host]);
    }
  }

  const globalUsed = new Set(globalUsage.rows.map((row) => row.slug as string));
  const entityUsed = new Set(entityUsage.rows.map((row) => row.slug as string));

  return definitions.map((definition) => {
    const placementPolicy = getWidgetPlacementPolicy(definition, entityType);
    const nativeHost = getWidgetAllowedHosts(definition)[0] ?? "widget_library";
    const shellPlacedHosts = shellUsedBySlug.get(definition.slug) ?? [];
    const inUse =
      definition.layer === "shell"
        ? shellPlacedHosts.length > 0
        : definition.layer === "global"
          ? globalUsed.has(definition.slug)
          : entityUsed.has(definition.slug);

    const placedHosts =
      definition.layer === "shell"
        ? shellPlacedHosts
        : inUse
          ? [nativeHost]
          : [];
    const placementState = getWidgetPlacementState(placementPolicy, placedHosts);

    const disabledReason =
      definition.layer === "entity" && entityType && !definition.supportedEntityTypes.includes(entityType)
        ? "Not supported for this entity"
        : placementState.disabledReason;

    return {
      ...definition,
      nativeHost,
      placementPolicy,
      placedHosts,
      availableHosts: placementState.availableHosts,
      placementSummary: placementState.summary,
      actionMode: placementState.actionMode,
      actionLabel: placementState.actionLabel,
      inUse,
      canAdd: placementState.canAdd,
      disabledReason,
    };
  }) as WidgetLibraryCatalogRecord[];
}

export async function bootstrapWidgetLibraryState(
  entityType?: WidgetEntityType,
  entityId?: string
) {
  const userId = await getUserId();

  await Promise.all([
    ensureDefaultShellWidgets(userId, "left_sidebar"),
    ensureDefaultShellWidgets(userId, "user_shell"),
    ensureDefaultGlobalWidgets(userId),
  ]);

  if (entityType && entityId) {
    await ensureDefaultEntityWidget(userId, entityType);
  }

  return { ok: true as const };
}

async function ensureDefaultGlobalWidgets(userId: string) {
  await ensureWidgetLibrarySeed();

  await pool.query(
    `
      INSERT INTO widget_instances (definition_id, layer, position, title, user_id)
      SELECT d.id, 'global', 0, d.name, $1
      FROM widget_definitions d
      WHERE d.slug = 'global_overview'
      AND NOT EXISTS (
        SELECT 1
        FROM widget_instances wi
        WHERE wi.user_id = $1
          AND wi.layer = 'global'
          AND wi.definition_id = d.id
      )
    `,
    [userId]
  );
}

async function ensureDefaultEntityWidget(userId: string, preferredEntityType?: WidgetEntityType) {
  await ensureWidgetLibrarySeed();
  await ensureEntityShellInstance();
  await migrateLegacyEntityWidgetsToShared(userId, preferredEntityType);

  const defaultEntityWidgets = [
    { slug: "entity_info", position: 0, slot: "pinned" },
    { slug: "entity_rating", position: 10, slot: "main" },
    { slug: "entity_resources", position: 20, slot: "main" },
    { slug: "entity_stories", position: 30, slot: "main" },
    { slug: "entity_gallery", position: 40, slot: "main" },
    { slug: "entity_nearby_pins", position: 50, slot: "main" },
    { slug: "entity_transport_mode", position: 60, slot: "main" },
    { slug: "entity_delete", position: 99, slot: "main" },
  ];

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(
      `
        SELECT pg_advisory_xact_lock(hashtextextended($1, 0))
      `,
      [`entity-shell-bootstrap:${userId}`]
    );

    const shellResult = await client.query<{ id: string }>(
      `
        SELECT si.id
        FROM shell_instances si
        INNER JOIN shell_definitions sd ON sd.id = si.definition_id
        WHERE si.owner_type = 'entity'
          AND si.owner_id = $1
          AND sd.slug = $2
        LIMIT 1
      `,
      [SHARED_ENTITY_SHELL_OWNER_ID, SHARED_ENTITY_SHELL_SLUG]
    );

    const shellId = shellResult.rows[0]?.id;

    if (!shellId) {
      throw new Error("Shared entity shell instance not found.");
    }

    const existingWidgetsResult = await client.query<{
      widgetInstanceId: string;
      slug: string;
      slot: string | null;
      position: number | null;
    }>(
      `
        SELECT
          wi.id as "widgetInstanceId",
          wd.slug,
          wp.slot,
          wp.position
        FROM widget_instances wi
        INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
        LEFT JOIN widget_placements wp
          ON wp.widget_instance_id = wi.id
         AND wp.shell_instance_id = $2::uuid
        WHERE wi.user_id = $1
          AND wi.layer = 'entity'
          AND wi.entity_type IS NULL
          AND wi.entity_id IS NULL
          AND wd.slug = ANY($3::text[])
      `,
      [userId, shellId, defaultEntityWidgets.map((widget) => widget.slug)]
    );

    const widgetsBySlug = new Map(
      existingWidgetsResult.rows.map((row) => [row.slug, row])
    );

    for (const widget of defaultEntityWidgets) {
      let existingWidget = widgetsBySlug.get(widget.slug);

      if (!existingWidget) {
        const insertedWidgetResult = await client.query<{
          widgetInstanceId: string;
        }>(
          `
            INSERT INTO widget_instances (definition_id, layer, entity_type, entity_id, position, title, user_id)
            SELECT d.id, 'entity', NULL, NULL, $2, d.name, $1
            FROM widget_definitions d
            WHERE d.slug = $3
            RETURNING id as "widgetInstanceId"
          `,
          [userId, widget.position, widget.slug]
        );

        existingWidget = {
          widgetInstanceId: insertedWidgetResult.rows[0].widgetInstanceId,
          slug: widget.slug,
          slot: null,
          position: null,
        };

        widgetsBySlug.set(widget.slug, existingWidget);
      }

      if (existingWidget.slot && existingWidget.position !== null) {
        continue;
      }

      const slotConflictResult = await client.query<{ occupied: boolean }>(
        `
          SELECT TRUE as occupied
          FROM widget_placements
          WHERE shell_instance_id = $1::uuid
            AND slot = $2
            AND position = $3
          LIMIT 1
        `,
        [shellId, widget.slot, widget.position]
      );

      let placementPosition = widget.position;

      if (slotConflictResult.rows[0]?.occupied) {
        const nextPositionResult = await client.query<{ value: number }>(
          `
            SELECT COALESCE(MAX(position), -10) + 10 AS value
            FROM widget_placements
            WHERE shell_instance_id = $1::uuid
              AND slot = $2
          `,
          [shellId, widget.slot]
        );

        placementPosition = nextPositionResult.rows[0]?.value ?? widget.position;
      }

      await client.query(
        `
          INSERT INTO widget_placements (shell_instance_id, widget_instance_id, slot, position)
          VALUES ($1::uuid, $2::uuid, $3, $4)
          ON CONFLICT (shell_instance_id, widget_instance_id)
          DO NOTHING
        `,
        [shellId, existingWidget.widgetInstanceId, widget.slot, placementPosition]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getGlobalWidgets() {
  const userId = await getUserId();

  const { rows } = await pool.query(
    `
      SELECT
        wi.id,
        wi.definition_id as "definitionId",
        wd.slug,
        COALESCE(wi.title, wd.name) as name,
        wi.layer,
        wi.entity_type as "entityType",
        wi.entity_id as "entityId",
        wd.component_key as "componentKey",
        wi.position,
        wi.config,
        wi.state
      FROM widget_instances wi
      INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
      WHERE wi.user_id = $1
        AND wi.layer = 'global'
      ORDER BY wi.position ASC, wi.created_at ASC
    `,
    [userId]
  );

  return rows as WidgetInstanceRecord[];
}

export async function getWidgetCenterSnapshot() {
  let [widgets, definitions, generatedWidgets] = await Promise.all([
    getGlobalWidgets(),
    getWidgetLibraryCatalog(),
    getGeneratedWidgets(),
  ]);

  if (widgets.length === 0 || definitions.length === 0) {
    await bootstrapWidgetLibraryState();
    [widgets, definitions, generatedWidgets] = await Promise.all([
      getGlobalWidgets(),
      getWidgetLibraryCatalog(),
      getGeneratedWidgets(),
    ]);
  }

  return { widgets, definitions, generatedWidgets };
}

export async function addGlobalWidget(definitionSlug: string) {
  const userId = await getUserId();
  await ensureWidgetLibrarySeed();

  const { rows } = await pool.query(
    `
      WITH next_position AS (
        SELECT COALESCE(MAX(wi.position), -1) + 1 AS value
        FROM widget_instances wi
        WHERE wi.user_id = $1
          AND wi.layer = 'global'
      )
      INSERT INTO widget_instances (definition_id, layer, position, title, user_id)
      SELECT d.id, 'global', next_position.value, d.name, $1
      FROM widget_definitions d
      CROSS JOIN next_position
      WHERE d.slug = $2
        AND d.layer = 'global'
      RETURNING id
    `,
    [userId, definitionSlug]
  );

  return rows[0];
}

export async function addWidgetFromLibrary(
  definitionSlug: string,
  entityType?: WidgetEntityType,
  entityId?: string,
  targetHosts?: WidgetHost[]
) {
  const userId = await getUserId();
  await ensureWidgetLibrarySeed();

  const definitionResult = await pool.query(
    `
      SELECT
        id,
        slug,
        name,
        layer,
        supported_entity_types as "supportedEntityTypes",
        component_key as "componentKey",
        default_config as "defaultConfig",
        is_system as "isSystem"
      FROM widget_definitions
      WHERE slug = $1
      LIMIT 1
    `,
    [definitionSlug]
  );

  const definition = definitionResult.rows[0] as WidgetDefinitionRecord | undefined;

  if (!definition) {
    throw new Error("Widget definition not found.");
  }

  const placementPolicy = getWidgetPlacementPolicy(definition, entityType);

  if (definition.layer === "global") {
    if (placementPolicy.mode !== "required_fixed" && placementPolicy.mode !== "single_fixed_host") {
      throw new Error("Selectable placement for global widgets is not implemented yet.");
    }
    return addGlobalWidget(definitionSlug);
  }

  if (definition.layer === "shell") {
    if (placementPolicy.mode === "required_fixed") {
      const nativeHost = getWidgetAllowedHosts(definition)[0];

      if (nativeHost === "left_sidebar" || nativeHost === "user_shell") {
        await ensureDefaultShellWidgets(userId, nativeHost);
        return { ok: true, host: nativeHost };
      }

      throw new Error("Unsupported native shell host.");
    }

    if (
      (placementPolicy.mode === "single_selectable_host" || placementPolicy.mode === "multi_host") &&
      (!targetHosts || targetHosts.length === 0)
    ) {
      throw new Error("Choose at least one shell for this widget.");
    }

    const requestedHosts =
      placementPolicy.mode === "single_selectable_host"
        ? [targetHosts![0]]
        : [...new Set(targetHosts)];

    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(
        `
          SELECT pg_advisory_xact_lock(hashtextextended($1, 0))
        `,
        [`shell-widget-add:${userId}:${definition.slug}`]
      );

      const existingWidgetResult = await client.query<{ id: string }>(
        `
          SELECT wi.id
          FROM widget_instances wi
          WHERE wi.user_id = $1
            AND wi.layer = 'shell'
            AND wi.definition_id = $2::uuid
          LIMIT 1
        `,
        [userId, definition.id]
      );

      let widgetInstanceId = existingWidgetResult.rows[0]?.id ?? null;

      if (!widgetInstanceId) {
        const createdWidgetResult = await client.query<{ id: string }>(
          `
            INSERT INTO widget_instances (definition_id, layer, position, title, user_id)
            VALUES ($1::uuid, 'shell', 0, $2, $3)
            RETURNING id
          `,
          [definition.id, definition.name, userId]
        );

        widgetInstanceId = createdWidgetResult.rows[0].id;
      }

      const existingPlacementsResult = await client.query<{
        shellInstanceId: string;
        ownerType: string;
        ownerId: string;
        shellSlug: string;
      }>(
        `
          SELECT
            si.id as "shellInstanceId",
            si.owner_type as "ownerType",
            si.owner_id as "ownerId",
            sd.slug as "shellSlug"
          FROM widget_placements wp
          INNER JOIN shell_instances si ON si.id = wp.shell_instance_id
          INNER JOIN shell_definitions sd ON sd.id = si.definition_id
          WHERE wp.widget_instance_id = $1::uuid
        `,
        [widgetInstanceId]
      );

      const placedHosts = existingPlacementsResult.rows
        .map((row) => mapShellPlacementHost(row.ownerType, row.ownerId, row.shellSlug))
        .filter((host): host is WidgetHost => Boolean(host));

      if (placementPolicy.mode === "single_selectable_host" && placedHosts.length > 0) {
        throw new Error("This widget is already placed in the application.");
      }

      for (const host of requestedHosts) {
        if (!placementPolicy.hosts.includes(host)) {
          continue;
        }

        if (placedHosts.includes(host)) {
          continue;
        }

        const shellInstanceId = await getShellInstanceIdForHost(client, userId, host);

        if (!shellInstanceId) {
          continue;
        }

        const nextPositionResult = await client.query<{ value: number }>(
          `
            SELECT COALESCE(MAX(position), -10) + 10 AS value
            FROM widget_placements
            WHERE shell_instance_id = $1::uuid
              AND slot = 'main'
          `,
          [shellInstanceId]
        );

        await client.query(
          `
            INSERT INTO widget_placements (shell_instance_id, widget_instance_id, slot, position)
            VALUES ($1::uuid, $2::uuid, 'main', $3)
            ON CONFLICT (shell_instance_id, widget_instance_id) DO NOTHING
          `,
          [shellInstanceId, widgetInstanceId, nextPositionResult.rows[0]?.value ?? 0]
        );
      }

      await client.query("COMMIT");
      return { ok: true, host: requestedHosts[0] ?? null };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  if (entityType && !definition.supportedEntityTypes.includes(entityType)) {
    throw new Error("Widget does not support this entity type.");
  }

  if (
    (placementPolicy.mode === "single_selectable_host" || placementPolicy.mode === "multi_host") &&
    (!targetHosts || targetHosts.length === 0)
  ) {
    throw new Error("This widget requires choosing a target panel from the widget pool.");
  }

  const preferredEntityType = entityType ?? definition.supportedEntityTypes[0] ?? "pin";

  await ensureDefaultEntityWidget(userId, preferredEntityType);

  const { rows } = await pool.query(
    `
      WITH entity_shell AS (
        SELECT si.id
        FROM shell_instances si
        INNER JOIN shell_definitions sd ON sd.id = si.definition_id
        WHERE si.owner_type = 'entity'
          AND si.owner_id = $2
          AND sd.slug = $3
        LIMIT 1
      ),
      next_position AS (
        SELECT COALESCE(MAX(wp.position), -10) + 10 AS value
        FROM widget_placements wp
        INNER JOIN widget_instances wi ON wi.id = wp.widget_instance_id
        WHERE wi.user_id = $1
          AND wi.layer = 'entity'
          AND wi.entity_type IS NULL
          AND wi.entity_id IS NULL
      ),
      inserted_widget AS (
        INSERT INTO widget_instances (definition_id, layer, entity_type, entity_id, position, title, user_id)
        SELECT d.id, 'entity', NULL, NULL, next_position.value, d.name, $1
        FROM widget_definitions d
        CROSS JOIN next_position
        WHERE d.slug = $5
          AND d.layer = 'entity'
          AND $4 = ANY(d.supported_entity_types)
          AND NOT EXISTS (
            SELECT 1
            FROM widget_instances wi
            WHERE wi.user_id = $1
              AND wi.layer = 'entity'
              AND wi.entity_type IS NULL
              AND wi.entity_id IS NULL
              AND wi.definition_id = d.id
          )
        RETURNING id, position
      )
      INSERT INTO widget_placements (shell_instance_id, widget_instance_id, slot, position)
      SELECT entity_shell.id, inserted_widget.id, 'main', inserted_widget.position
      FROM inserted_widget
      CROSS JOIN entity_shell
      RETURNING widget_instance_id as "widgetInstanceId"
    `,
    [userId, SHARED_ENTITY_SHELL_OWNER_ID, SHARED_ENTITY_SHELL_SLUG, preferredEntityType, definitionSlug]
  );

  return {
    ok: true,
    host: SHARED_ENTITY_SHELL_SLUG,
    widgetInstanceId: rows[0]?.widgetInstanceId ?? null,
  };
}

export async function removeEntityWidget(
  entityType: WidgetEntityType,
  entityId: string,
  widgetId: string
) {
  const userId = await getUserId();

  const widgetResult = await pool.query<{
    id: string;
    slug: string;
  }>(
    `
      SELECT wi.id, wd.slug
      FROM widget_instances wi
      INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
      WHERE wi.user_id = $1
        AND wi.layer = 'entity'
        AND wi.entity_type IS NULL
        AND wi.entity_id IS NULL
        AND wi.id = $4::uuid
      LIMIT 1
    `,
    [userId, entityType, entityId, widgetId]
  );

  const widget = widgetResult.rows[0];

  if (!widget) {
    throw new Error("Entity widget not found.");
  }

  if (requiredEntityWidgetSlugs.includes(widget.slug as typeof requiredEntityWidgetSlugs[number])) {
    throw new Error("This widget is required and cannot be removed.");
  }

  await pool.query(
    `
      DELETE FROM widget_instances
      WHERE user_id = $1
        AND layer = 'entity'
        AND entity_type IS NULL
        AND entity_id IS NULL
        AND id = $4::uuid
    `,
    [userId, entityType, entityId, widgetId]
  );

  return { ok: true };
}

export async function removeShellWidgetPlacement(
  widgetId: string,
  host: Extract<WidgetHost, "left_sidebar" | "user_shell" | "shared_entity_shell">
) {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const shellInstanceId = await getShellInstanceIdForHost(client, userId, host);

    if (!shellInstanceId) {
      throw new Error("Shell instance not found.");
    }

    const widgetResult = await client.query<{
      id: string;
      slug: string;
      componentKey: WidgetComponentKey;
      supportedEntityTypes: WidgetEntityType[];
    }>(
      `
        SELECT
          wi.id,
          wd.slug,
          wd.component_key as "componentKey",
          wd.supported_entity_types as "supportedEntityTypes"
        FROM widget_instances wi
        INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
        LEFT JOIN widget_placements wp ON wp.widget_instance_id = wi.id
        WHERE wi.user_id::text = $1::text
          AND wi.layer = 'shell'
          AND (
            wi.id = $2::uuid
            OR (
              wp.id = $2::uuid
              AND wp.shell_instance_id = $3::uuid
            )
          )
        LIMIT 1
      `,
      [userId, widgetId, shellInstanceId]
    );

    const widget = widgetResult.rows[0];

    if (!widget) {
      throw new Error("Shell widget not found.");
    }

    const placementPolicy = getWidgetPlacementPolicy({
      layer: "shell",
      componentKey: widget.componentKey,
      supportedEntityTypes: widget.supportedEntityTypes,
      slug: widget.slug,
    });

    if (!placementPolicy.removable || placementPolicy.managedBySystem) {
      throw new Error("This widget is managed by the system and cannot be removed.");
    }

    await client.query(
      `
        DELETE FROM widget_placements
        WHERE shell_instance_id = $1::uuid
          AND (
            widget_instance_id = $2::uuid
            OR id = $3::uuid
          )
      `,
      [shellInstanceId, widget.id, widgetId]
    );

    const remainingPlacementsResult = await client.query<{ count: string }>(
      `
        SELECT COUNT(*)::text as count
        FROM widget_placements
        WHERE widget_instance_id = $1::uuid
      `,
      [widget.id]
    );

    if ((remainingPlacementsResult.rows[0]?.count ?? "0") === "0") {
      await client.query(
        `
          DELETE FROM widget_instances
          WHERE user_id::text = $1::text
            AND layer = 'shell'
            AND id = $2::uuid
        `,
        [userId, widget.id]
      );
    }

    await client.query("COMMIT");
    return { ok: true as const };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function reorderGlobalWidgets(orderedWidgetIds: string[]) {
  const userId = await getUserId();

  if (orderedWidgetIds.length === 0) {
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const ownership = await client.query(
      `
        SELECT wi.id
        FROM widget_instances wi
        WHERE wi.user_id = $1
          AND wi.layer = 'global'
          AND wi.id = ANY($2::uuid[])
      `,
      [userId, orderedWidgetIds]
    );

    if (ownership.rowCount !== orderedWidgetIds.length) {
      throw new Error("Global widgets not found.");
    }

    await client.query(
      `
        UPDATE widget_instances
        SET
          position = position + 1000,
          updated_at = NOW()
        WHERE user_id = $1
          AND layer = 'global'
          AND id = ANY($2::uuid[])
      `,
      [userId, orderedWidgetIds]
    );

    for (const [position, widgetId] of orderedWidgetIds.entries()) {
      await client.query(
        `
          UPDATE widget_instances
          SET
            position = $3,
            updated_at = NOW()
          WHERE user_id = $1
            AND layer = 'global'
            AND id = $2::uuid
        `,
        [userId, widgetId, position]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function getEntityWidgetsByUserId(userId: string, ..._entityContext: [WidgetEntityType, string]) {
  void _entityContext;
  const { rows } = await pool.query(
    `
      SELECT
        wi.id,
        wi.definition_id as "definitionId",
        wd.slug,
        COALESCE(wi.title, wd.name) as name,
        wi.layer,
        wi.entity_type as "entityType",
        wi.entity_id as "entityId",
        wd.component_key as "componentKey",
        wp.slot,
        wp.position,
        wi.config,
        wi.state,
        wi.runtime_overrides as "runtimeOverrides",
        FALSE as "placedInLeftSidebar"
      FROM widget_instances wi
      INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
      INNER JOIN widget_placements wp ON wp.widget_instance_id = wi.id
      INNER JOIN shell_instances si ON si.id = wp.shell_instance_id
      INNER JOIN shell_definitions sd ON sd.id = si.definition_id
      WHERE wi.user_id = $1
        AND si.owner_type = 'entity'
        AND si.owner_id = $2
        AND sd.slug = $3
        AND (
          (
            wi.layer = 'entity'
            AND wi.entity_type IS NULL
            AND wi.entity_id IS NULL
            AND wd.component_key = ANY($4::text[])
          )
          OR (
            wi.layer = 'shell'
            AND wd.component_key = ANY($5::text[])
          )
        )
      ORDER BY wp.position ASC, wp.created_at ASC
    `,
    [
      userId,
      SHARED_ENTITY_SHELL_OWNER_ID,
      SHARED_ENTITY_SHELL_SLUG,
      [...sharedEntityWidgetComponentKeys],
      ["shell_notes", "shell_clock"],
    ]
  );

  return rows as WidgetInstanceRecord[];
}

export async function getEntityWidgets(entityType: WidgetEntityType, entityId: string) {
  const userId = await getUserId();
  return getEntityWidgetsByUserId(userId, entityType, entityId);
}

export async function reorderEntityWidgets(
  entityType: WidgetEntityType,
  entityId: string,
  orderedWidgetIds: string[]
) {
  const userId = await getUserId();

  if (orderedWidgetIds.length === 0) {
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const ownership = await client.query(
      `
        SELECT wi.id
        FROM widget_instances wi
        WHERE wi.user_id = $1
          AND wi.layer = 'entity'
          AND wi.entity_type IS NULL
          AND wi.entity_id IS NULL
          AND wi.id = ANY($4::uuid[])
      `,
      [userId, entityType, entityId, orderedWidgetIds]
    );

    if (ownership.rowCount !== orderedWidgetIds.length) {
      throw new Error("Entity widgets not found.");
    }

    await client.query(
      `
        UPDATE widget_instances
        SET
          position = position + 1000,
          updated_at = NOW()
        WHERE user_id = $1
          AND layer = 'entity'
          AND entity_type IS NULL
          AND entity_id IS NULL
          AND id = ANY($4::uuid[])
      `,
      [userId, entityType, entityId, orderedWidgetIds]
    );

    for (const [position, widgetId] of orderedWidgetIds.entries()) {
      await client.query(
        `
          UPDATE widget_instances
          SET
            position = $4,
            updated_at = NOW()
          WHERE user_id = $1
            AND layer = 'entity'
            AND entity_type IS NULL
            AND entity_id IS NULL
            AND id = $5::uuid
        `,
        [userId, entityType, entityId, position, widgetId]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateWidgetChromeBackground(
  widgetId: string,
  backgroundStyle: string
) {
  const userId = await getUserId();

  await pool.query(
    `
      UPDATE widget_instances
      SET
        config = jsonb_set(
          COALESCE(config, '{}'::jsonb),
          '{chromeBackgroundStyle}',
          to_jsonb($3::text),
          true
        ),
        updated_at = NOW()
      WHERE id = $1::uuid
        AND user_id = $2
    `,
    [widgetId, userId, backgroundStyle]
  );

  return { ok: true, widgetId, backgroundStyle };
}

async function getEntityWidgetPayloadByUserId(userId: string, entityType: WidgetEntityType, entityId: string) {
  const { table, geometryKind } = mapEntityTable(entityType);

  // TEMP(tech-debt): image still falls back to legacy pin media until gallery/media
  // is fully migrated to dedicated enrichment records.
  const selectImage = entityType === "pin" ? "e.image_url" : "NULL";
  const selectLegacyDescription = entityType === "pin" ? "e.note" : "NULL";

  const { rows } = await pool.query(
    `
      SELECT
        e.id,
        e.container_id as "containerId",
        $1::text as type,
        COALESCE(ed.title, e.name, CONCAT('Untitled ', INITCAP($1::text))) as title,
        c.name as subtitle,
        COALESCE(NULLIF(ed.description, ''), ${selectLegacyDescription}) as description,
        COALESCE(media.public_url, ${selectImage}) as "imageUrl",
        c.id as "collectionId",
        c.name as "collectionName",
        c.color as "collectionColor",
        c.type as "collectionType"
      FROM ${table} e
      LEFT JOIN entity_details ed ON ed.entity_container_id = e.container_id
      LEFT JOIN LATERAL (
        SELECT emi.public_url
        FROM entity_media_items emi
        WHERE emi.entity_container_id = e.container_id
          AND emi.user_id = $3::text
        ORDER BY emi.position ASC, emi.created_at ASC
        LIMIT 1
      ) media ON TRUE
      LEFT JOIN collections c ON c.id = e.collection_id
      WHERE e.id = $2::uuid
        AND e.user_id::text = $3::text
      LIMIT 1
    `,
    [entityType, entityId, userId]
  );

  const row = rows[0];
  if (!row) {
    throw new Error(`Entity not found for widget payload: ${entityType}/${entityId}`);
  }

  const payload: WidgetEntityPayload = {
    id: row.id,
    type: entityType,
    title: row.title,
    subtitle: row.subtitle ?? null,
    description: row.description ?? null,
    imageUrl: row.imageUrl ?? null,
    collection: row.collectionId
      ? {
          id: row.collectionId,
          name: row.collectionName,
          color: row.collectionColor,
          type: row.collectionType,
        }
      : null,
    geometryKind,
    metadata: {
      containerId: row.containerId ?? null,
    },
  };

  return payload;
}

export async function getEntityWidgetPayload(entityType: WidgetEntityType, entityId: string) {
  const userId = await getUserId();
  return getEntityWidgetPayloadByUserId(userId, entityType, entityId);
}

export async function getEntityShellSnapshot(entityType: WidgetEntityType, entityId: string) {
  const userId = await getUserId();

  const [entityPayload, entityWidgets] = await Promise.all([
    getEntityWidgetPayloadByUserId(userId, entityType, entityId),
    getEntityWidgetsByUserId(userId, entityType, entityId),
  ]);

  const presentComponentKeys = new Set(entityWidgets.map((widget) => widget.componentKey));
  const missingSharedWidgets = sharedEntityWidgetComponentKeys.some(
    (componentKey) => !presentComponentKeys.has(componentKey)
  );

  return {
    entityPayload,
    entityWidgets,
    bootstrapRequired: entityWidgets.length === 0 || missingSharedWidgets,
  };
}

export async function bootstrapEntityShellState(entityType: WidgetEntityType, entityId: string) {
  void entityId;
  const userId = await getUserId();
  await ensureDefaultEntityWidget(userId, entityType);
  return { ok: true as const };
}

export async function updateEntityInfo(
  entityType: WidgetEntityType,
  entityId: string,
  title: string,
  description: string,
  imageUrl: string | null
) {
  const userId = await getUserId();
  const client = await pool.connect();
  const normalizedTitle = title.trim() || `Untitled ${entityType === "pin" ? "Marker" : entityType === "trace" ? "Path" : "Area"}`;

  try {
    await client.query("BEGIN");

    const containerId = await getEntityContainerId(client, entityType, entityId, userId);

    if (!containerId) {
      throw new Error("Entity container not found.");
    }

    await upsertEntityDetails(client, {
      entityContainerId: containerId,
      userId,
      title: normalizedTitle,
      description,
    });

    if (entityType === "pin") {
      // TEMP(tech-debt): keep legacy pin fields in sync until pin media and notes are fully
      // migrated to canonical container enrichments.
      await client.query(
        `
          UPDATE pins
          SET name = $1,
              note = $2,
              image_url = $3
          WHERE id = $4::uuid
            AND user_id = $5
        `,
        [normalizedTitle, description, imageUrl, entityId, userId]
      );
    }

    await client.query("COMMIT");

    return {
      id: entityId,
      title: normalizedTitle,
      description,
      imageUrl,
      containerId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateEntityTitle(
  entityType: WidgetEntityType,
  entityId: string,
  title: string
) {
  const userId = await getUserId();
  const client = await pool.connect();
  const normalizedTitle =
    title.trim() ||
    `Untitled ${
      entityType === "pin" ? "Marker" : entityType === "trace" ? "Path" : "Area"
    }`;

  try {
    await client.query("BEGIN");

    const containerId = await getEntityContainerId(client, entityType, entityId, userId);

    if (!containerId) {
      throw new Error("Entity container not found.");
    }

    await upsertEntityDetails(client, {
      entityContainerId: containerId,
      userId,
      title: normalizedTitle,
      description: "",
    });

    if (entityType === "pin") {
      await client.query(
        `
          UPDATE pins
          SET name = $1
          WHERE id = $2::uuid
            AND user_id::text = $3::text
        `,
        [normalizedTitle, entityId, userId]
      );
    }

    await client.query("COMMIT");

    return {
      id: entityId,
      title: normalizedTitle,
      containerId,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getEntityMediaItems(
  entityType: WidgetEntityType,
  entityId: string
): Promise<EntityMediaItemRecord[]> {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    const containerId = await getEntityContainerId(client, entityType, entityId, userId);

    if (!containerId) {
      return [];
    }

    return getEntityMediaItemsByContainerId(client, containerId, userId);
  } finally {
    client.release();
  }
}

export async function addEntityMediaItem(
  entityType: WidgetEntityType,
  entityId: string,
  params: {
    storageKey: string;
    publicUrl: string;
    caption?: string | null;
  }
): Promise<EntityMediaItemRecord> {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const containerId = await getEntityContainerId(client, entityType, entityId, userId);

    if (!containerId) {
      throw new Error("Entity container not found.");
    }

    const nextPositionResult = await client.query<{ value: number }>(
      `
        SELECT COALESCE(MAX(position), -10) + 10 AS value
        FROM entity_media_items
        WHERE entity_container_id = $1::uuid
          AND user_id = $2
      `,
      [containerId, userId]
    );

    const nextPosition = nextPositionResult.rows[0]?.value ?? 0;

    const { rows } = await client.query<{
      id: string;
      storage_key: string;
      public_url: string;
      caption: string | null;
      position: number;
    }>(
      `
        INSERT INTO entity_media_items (
          entity_container_id,
          user_id,
          storage_key,
          public_url,
          caption,
          position,
          updated_at
        )
        VALUES ($1::uuid, $2, $3, $4, $5, $6, NOW())
        RETURNING id, storage_key, public_url, caption, position
      `,
      [containerId, userId, params.storageKey, params.publicUrl, params.caption ?? null, nextPosition]
    );

    if (entityType === "pin") {
      await syncLegacyPinImageFromMedia(client, entityId, userId);
    }

    await client.query("COMMIT");

    const row = rows[0];
    return {
      id: row.id,
      storageKey: row.storage_key,
      publicUrl: row.public_url,
      caption: row.caption,
      position: row.position,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function uploadEntityMediaItem(
  entityType: WidgetEntityType,
  entityId: string,
  formData: FormData
) {
  const userId = await getUserId();
  await assertRateLimit({
    scope: "media_upload",
    identifier: userId,
    limit: 20,
    windowMs: 10 * 60 * 1000,
    blockMs: 10 * 60 * 1000,
  });

  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Error("No file uploaded.");
  }

  validateImageUpload(file);
  const upload = await writeUploadAsset(file);

  try {
    return await addEntityMediaItem(entityType, entityId, upload);
  } catch (error) {
    await deleteUploadFromUrl(upload.publicUrl);
    throw error;
  }
}

export async function removeEntityMediaItem(
  entityType: WidgetEntityType,
  entityId: string,
  mediaItemId: string
) {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const containerId = await getEntityContainerId(client, entityType, entityId, userId);

    if (!containerId) {
      throw new Error("Entity container not found.");
    }

    const { rows } = await client.query<{ public_url: string }>(
      `
        DELETE FROM entity_media_items
        WHERE id = $1::uuid
          AND entity_container_id = $2::uuid
          AND user_id = $3
        RETURNING public_url
      `,
      [mediaItemId, containerId, userId]
    );

    const publicUrl = rows[0]?.public_url ?? null;

    if (entityType === "pin") {
      await syncLegacyPinImageFromMedia(client, entityId, userId);
    }

    await client.query("COMMIT");

    if (publicUrl) {
      await deleteUploadFromUrl(publicUrl);
    }

    return { ok: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getEntityStoryEntries(
  entityType: WidgetEntityType,
  entityId: string
): Promise<EntityStoryEntryRecord[]> {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    const containerId = await getEntityContainerId(client, entityType, entityId, userId);

    if (!containerId) {
      return [];
    }

    const { rows } = await client.query<{
      id: string;
      title: string | null;
      body_markdown: string;
      position: number;
      published_at: string | null;
    }>(
      `
        SELECT id, title, body_markdown, position, published_at
        FROM entity_story_entries
        WHERE entity_container_id = $1::uuid
          AND user_id = $2
        ORDER BY position ASC, created_at ASC
      `,
      [containerId, userId]
    );

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      bodyMarkdown: row.body_markdown,
      position: row.position,
      publishedAt: row.published_at,
    }));
  } finally {
    client.release();
  }
}

export async function addEntityStoryEntry(
  entityType: WidgetEntityType,
  entityId: string,
  params?: {
    title?: string | null;
    bodyMarkdown?: string;
  }
): Promise<EntityStoryEntryRecord> {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const containerId = await getEntityContainerId(client, entityType, entityId, userId);

    if (!containerId) {
      throw new Error("Entity container not found.");
    }

    const nextPositionResult = await client.query<{ value: number }>(
      `
        SELECT COALESCE(MAX(position), -10) + 10 AS value
        FROM entity_story_entries
        WHERE entity_container_id = $1::uuid
          AND user_id = $2
      `,
      [containerId, userId]
    );

    const nextPosition = nextPositionResult.rows[0]?.value ?? 0;

    const { rows } = await client.query<{
      id: string;
      title: string | null;
      body_markdown: string;
      position: number;
      published_at: string | null;
    }>(
      `
        INSERT INTO entity_story_entries (
          entity_container_id,
          user_id,
          title,
          body_markdown,
          position,
          updated_at
        )
        VALUES ($1::uuid, $2, $3, $4, $5, NOW())
        RETURNING id, title, body_markdown, position, published_at
      `,
      [
        containerId,
        userId,
        params?.title?.trim() || null,
        params?.bodyMarkdown ?? "",
        nextPosition,
      ]
    );

    await client.query("COMMIT");

    return {
      id: rows[0].id,
      title: rows[0].title,
      bodyMarkdown: rows[0].body_markdown,
      position: rows[0].position,
      publishedAt: rows[0].published_at,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateEntityStoryEntry(
  entityType: WidgetEntityType,
  entityId: string,
  storyEntryId: string,
  params: {
    title?: string | null;
    bodyMarkdown: string;
  }
): Promise<EntityStoryEntryRecord> {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const containerId = await getEntityContainerId(client, entityType, entityId, userId);

    if (!containerId) {
      throw new Error("Entity container not found.");
    }

    const { rows } = await client.query<{
      id: string;
      title: string | null;
      body_markdown: string;
      position: number;
      published_at: string | null;
    }>(
      `
        UPDATE entity_story_entries
        SET
          title = $4,
          body_markdown = $5,
          updated_at = NOW()
        WHERE id = $1::uuid
          AND entity_container_id = $2::uuid
          AND user_id = $3
        RETURNING id, title, body_markdown, position, published_at
      `,
      [storyEntryId, containerId, userId, params.title?.trim() || null, params.bodyMarkdown]
    );

    if (!rows[0]) {
      throw new Error("Story entry not found.");
    }

    await client.query("COMMIT");

    return {
      id: rows[0].id,
      title: rows[0].title,
      bodyMarkdown: rows[0].body_markdown,
      position: rows[0].position,
      publishedAt: rows[0].published_at,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function removeEntityStoryEntry(
  entityType: WidgetEntityType,
  entityId: string,
  storyEntryId: string
): Promise<void> {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const containerId = await getEntityContainerId(client, entityType, entityId, userId);

    if (!containerId) {
      throw new Error("Entity container not found.");
    }

    await client.query(
      `
        DELETE FROM entity_story_entries
        WHERE id = $1::uuid
          AND entity_container_id = $2::uuid
          AND user_id = $3
      `,
      [storyEntryId, containerId, userId]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getEntityResourceLinks(
  entityType: WidgetEntityType,
  entityId: string
): Promise<EntityResourceLinkRecord[]> {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    const containerId = await getEntityContainerId(client, entityType, entityId, userId);

    if (!containerId) {
      return [];
    }

    const { rows } = await client.query<{
      id: string;
      label: string | null;
      url: string;
      position: number;
      resolved_url: string | null;
      hostname: string | null;
      site_name: string | null;
      title: string | null;
      description: string | null;
      image_url: string | null;
      favicon_url: string | null;
      preview_status: "pending" | "ready" | "error" | null;
      error_message: string | null;
      fetched_at: string | null;
    }>(
      `
        SELECT
          erl.id,
          erl.label,
          erl.url,
          erl.position,
          erlp.resolved_url,
          erlp.hostname,
          erlp.site_name,
          erlp.title,
          erlp.description,
          erlp.image_url,
          erlp.favicon_url,
          erlp.status AS preview_status,
          erlp.error_message,
          erlp.fetched_at
        FROM entity_resource_links erl
        LEFT JOIN entity_resource_link_previews erlp
          ON erlp.resource_link_id = erl.id
        WHERE erl.entity_container_id = $1::uuid
          AND erl.user_id = $2
        ORDER BY erl.position ASC, erl.created_at ASC
      `,
      [containerId, userId]
    );

    return rows.map((row) => ({
      id: row.id,
      label: row.label,
      url: row.url,
      position: row.position,
      preview: row.preview_status
        ? {
            resolvedUrl: row.resolved_url,
            hostname: row.hostname,
            siteName: row.site_name,
            title: row.title,
            description: row.description,
            imageUrl: row.image_url,
            faviconUrl: row.favicon_url,
            status: row.preview_status,
            errorMessage: row.error_message ?? null,
            fetchedAt: row.fetched_at,
          }
        : null,
    }));
  } finally {
    client.release();
  }
}

function normalizeExternalResourceUrl(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    return "";
  }

  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed) ? trimmed : `https://${trimmed}`;
  const parsed = new URL(candidate);

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Resource URL must use http or https.");
  }

  return parsed.toString();
}

function decodeHtmlEntityText(input: string | null | undefined): string | null {
  if (!input) {
    return null;
  }

  return input
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim() || null;
}

function stripHtmlPreviewText(input: string | null | undefined): string | null {
  if (!input) {
    return null;
  }

  return decodeHtmlEntityText(input.replace(/\s+/g, " ").trim());
}

function extractMetaContent(html: string, matchers: RegExp[]): string | null {
  for (const matcher of matchers) {
    const matched = html.match(matcher)?.[1];
    const cleaned = stripHtmlPreviewText(matched);
    if (cleaned) {
      return cleaned;
    }
  }

  return null;
}

function resolveMaybeRelativeUrl(candidate: string | null, baseUrl: string): string | null {
  if (!candidate) {
    return null;
  }

  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return null;
  }
}

async function fetchResourceLinkPreview(url: string): Promise<{
  resolvedUrl: string;
  hostname: string;
  siteName: string | null;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  faviconUrl: string | null;
  status: "ready" | "error";
  errorMessage: string | null;
  fetchedAt: string;
}> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "VisitAllPreviewBot/1.0 (+https://visit-all.local)",
      },
    });

    const resolvedUrl = response.url || url;
    const origin = new URL(resolvedUrl).origin;
    const hostname = new URL(resolvedUrl).hostname.replace(/^www\./, "");
    const fetchedAt = new Date().toISOString();

    if (!response.ok) {
      return {
        resolvedUrl,
        hostname,
        siteName: hostname,
        title: null,
        description: null,
        imageUrl: null,
        faviconUrl: `${origin}/favicon.ico`,
        status: "error",
        errorMessage: `Preview fetch failed with ${response.status}.`,
        fetchedAt,
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return {
        resolvedUrl,
        hostname,
        siteName: hostname,
        title: hostname,
        description: null,
        imageUrl: null,
        faviconUrl: `${origin}/favicon.ico`,
        status: "ready",
        errorMessage: null,
        fetchedAt,
      };
    }

    const html = await response.text();
    const title =
      extractMetaContent(html, [
        /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      ]) ??
      stripHtmlPreviewText(html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]) ??
      hostname;

    const description = extractMetaContent(html, [
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ]);

    const siteName = extractMetaContent(html, [
      /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']application-name["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    ]) ?? hostname;

    const imageUrl = resolveMaybeRelativeUrl(
      extractMetaContent(html, [
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      ]),
      resolvedUrl
    );

    const faviconUrl =
      resolveMaybeRelativeUrl(
        extractMetaContent(html, [
          /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i,
          /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["'][^>]*>/i,
          /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/i,
        ]),
        resolvedUrl
      ) ?? `${origin}/favicon.ico`;

    return {
      resolvedUrl,
      hostname,
      siteName,
      title,
      description,
      imageUrl,
      faviconUrl,
      status: "ready",
      errorMessage: null,
      fetchedAt,
    };
  } catch (error) {
    const normalized = new URL(url);
    return {
      resolvedUrl: url,
      hostname: normalized.hostname.replace(/^www\./, ""),
      siteName: normalized.hostname.replace(/^www\./, ""),
      title: null,
      description: null,
      imageUrl: null,
      faviconUrl: `${normalized.origin}/favicon.ico`,
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Preview fetch failed.",
      fetchedAt: new Date().toISOString(),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function upsertEntityResourceLinkPreview(resourceLinkId: string, url: string): Promise<void> {
  const preview = await fetchResourceLinkPreview(url);

  await pool.query(
    `
      INSERT INTO entity_resource_link_previews (
        resource_link_id,
        resolved_url,
        hostname,
        site_name,
        title,
        description,
        image_url,
        favicon_url,
        status,
        error_message,
        fetched_at,
        updated_at
      )
      VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::timestamptz, NOW())
      ON CONFLICT (resource_link_id)
      DO UPDATE SET
        resolved_url = EXCLUDED.resolved_url,
        hostname = EXCLUDED.hostname,
        site_name = EXCLUDED.site_name,
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url,
        favicon_url = EXCLUDED.favicon_url,
        status = EXCLUDED.status,
        error_message = EXCLUDED.error_message,
        fetched_at = EXCLUDED.fetched_at,
        updated_at = NOW()
    `,
    [
      resourceLinkId,
      preview.resolvedUrl,
      preview.hostname,
      preview.siteName,
      preview.title,
      preview.description,
      preview.imageUrl,
      preview.faviconUrl,
      preview.status,
      preview.errorMessage,
      preview.fetchedAt,
    ]
  );
}

export async function addEntityResourceLink(
  entityType: WidgetEntityType,
  entityId: string,
  params?: {
    label?: string | null;
    url?: string;
  }
): Promise<EntityResourceLinkRecord> {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const containerId = await getEntityContainerId(client, entityType, entityId, userId);

    if (!containerId) {
      throw new Error("Entity container not found.");
    }

    const nextPositionResult = await client.query<{ value: number }>(
      `
        SELECT COALESCE(MAX(position), -10) + 10 AS value
        FROM entity_resource_links
        WHERE entity_container_id = $1::uuid
          AND user_id = $2
      `,
      [containerId, userId]
    );

    const nextPosition = nextPositionResult.rows[0]?.value ?? 0;

    const { rows } = await client.query<{
      id: string;
      label: string | null;
      url: string;
      position: number;
    }>(
      `
        INSERT INTO entity_resource_links (
          entity_container_id,
          user_id,
          label,
          url,
          position,
          updated_at
        )
        VALUES ($1::uuid, $2, $3, $4, $5, NOW())
        RETURNING id, label, url, position
      `,
      [
        containerId,
        userId,
        params?.label?.trim() || null,
        params?.url?.trim() ? normalizeExternalResourceUrl(params.url) : "",
        nextPosition,
      ]
    );

    const createdLink = rows[0];
    await client.query("COMMIT");

    if (createdLink.url) {
      await upsertEntityResourceLinkPreview(createdLink.id, createdLink.url);
    }

    const resolved = (await getEntityResourceLinks(entityType, entityId)).find(
      (link) => link.id === createdLink.id
    );
    return resolved ?? { ...createdLink, preview: null };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function updateEntityResourceLink(
  entityType: WidgetEntityType,
  entityId: string,
  resourceLinkId: string,
  params: {
    label?: string | null;
    url: string;
  }
): Promise<EntityResourceLinkRecord> {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const containerId = await getEntityContainerId(client, entityType, entityId, userId);

    if (!containerId) {
      throw new Error("Entity container not found.");
    }

    const normalizedUrl = normalizeExternalResourceUrl(params.url);
    if (!normalizedUrl) {
      throw new Error("Resource URL is required.");
    }

    const existingLinkResult = await client.query<{ url: string }>(
      `
        SELECT url
        FROM entity_resource_links
        WHERE id = $1::uuid
          AND entity_container_id = $2::uuid
          AND user_id = $3
        LIMIT 1
      `,
      [resourceLinkId, containerId, userId]
    );

    const existingUrl = existingLinkResult.rows[0]?.url ?? null;

    const { rows } = await client.query<{
      id: string;
      label: string | null;
      url: string;
      position: number;
    }>(
      `
        UPDATE entity_resource_links
        SET label = $4,
            url = $5,
            updated_at = NOW()
        WHERE id = $1::uuid
          AND entity_container_id = $2::uuid
          AND user_id = $3
        RETURNING id, label, url, position
      `,
      [resourceLinkId, containerId, userId, params.label?.trim() || null, normalizedUrl]
    );

    if (!rows[0]) {
      throw new Error("Resource link not found.");
    }

    const updatedRow = rows[0];

    await client.query("COMMIT");

    if (existingUrl !== normalizedUrl) {
      await upsertEntityResourceLinkPreview(resourceLinkId, normalizedUrl);
    }

    const updatedLinks = await getEntityResourceLinks(entityType, entityId);
    const resolved = updatedLinks.find((link) => link.id === resourceLinkId);

    return resolved ?? { ...updatedRow, preview: null };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function removeEntityResourceLink(
  entityType: WidgetEntityType,
  entityId: string,
  resourceLinkId: string
) {
  const userId = await getUserId();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const containerId = await getEntityContainerId(client, entityType, entityId, userId);

    if (!containerId) {
      throw new Error("Entity container not found.");
    }

    await client.query(
      `
        DELETE FROM entity_resource_links
        WHERE id = $1::uuid
          AND entity_container_id = $2::uuid
          AND user_id = $3
      `,
      [resourceLinkId, containerId, userId]
    );

    await client.query("COMMIT");
    return { ok: true };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function getEntityRating(containerId: string) {
  const userId = await getUserId();

  const { rows } = await pool.query<{ value: number }>(
    `
      SELECT value
      FROM entity_ratings
      WHERE entity_container_id = $1::uuid
        AND user_id = $2
      LIMIT 1
    `,
    [containerId, userId]
  );

  return rows[0]?.value ?? null;
}

export async function updateEntityRating(containerId: string, value: number) {
  const userId = await getUserId();

  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("Rating must be an integer between 1 and 5.");
  }

  const { rows } = await pool.query<{ value: number }>(
    `
      INSERT INTO entity_ratings (entity_container_id, user_id, value, updated_at)
      VALUES ($1::uuid, $2, $3, NOW())
      ON CONFLICT (entity_container_id)
      DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = NOW()
      RETURNING value
    `,
    [containerId, userId, value]
  );

  return rows[0]?.value ?? value;
}

export async function getNearbyPinsForEntity(
  entityType: WidgetEntityType,
  entityId: string,
  options?: {
    limit?: number;
    minRating?: number | null;
    radiusMeters?: number | null;
  }
) {
  const userId = await getUserId();
  const limit = Math.min(Math.max(options?.limit ?? 3, 1), 6);
  const minRating = options?.minRating ?? null;
  const radiusMeters = options?.radiusMeters ?? 5000;

  const { rows } = await pool.query<{
    id: string;
    container_id: string;
    title: string;
    collection_id: string | null;
    collection_name: string | null;
    collection_color: string | null;
    image_url: string | null;
    rating: number | null;
    distance_meters: number;
    lng: number;
    lat: number;
  }>(
    `
      WITH target_entity AS (
        SELECT p.id, p.location AS anchor_geom, p.user_id::text AS user_id
        FROM pins p
        LEFT JOIN entity_containers ec ON ec.id = p.container_id
        WHERE $2::text = 'pin'
          AND p.id = $1::uuid
          AND p.user_id::text = $3::text
          AND COALESCE(ec.status, 'active') = 'active'

        UNION ALL

        SELECT t.id, ST_LineInterpolatePoint(t.path, 0.5) AS anchor_geom, t.user_id::text AS user_id
        FROM traces t
        LEFT JOIN entity_containers ec ON ec.id = t.container_id
        WHERE $2::text = 'trace'
          AND t.id = $1::uuid
          AND t.user_id::text = $3::text
          AND COALESCE(ec.status, 'active') = 'active'

        UNION ALL

        SELECT a.id, ST_PointOnSurface(a.path) AS anchor_geom, a.user_id::text AS user_id
        FROM areas a
        LEFT JOIN entity_containers ec ON ec.id = a.container_id
        WHERE $2::text = 'area'
          AND a.id = $1::uuid
          AND a.user_id::text = $3::text
          AND COALESCE(ec.status, 'active') = 'active'
      )
      SELECT
        p.id,
        p.container_id,
        COALESCE(ed.title, p.name, 'Untitled Marker') AS title,
        COALESCE(p.collection_id, ec.collection_id) AS collection_id,
        c.name AS collection_name,
        c.color AS collection_color,
        COALESCE(media.public_url, p.image_url) AS image_url,
        er.value AS rating,
        ST_DistanceSphere(p.location, te.anchor_geom) AS distance_meters,
        ST_X(p.location) AS lng,
        ST_Y(p.location) AS lat
      FROM target_entity te
      JOIN pins p
        ON p.user_id::text = te.user_id
       AND NOT ($2::text = 'pin' AND p.id = te.id)
      LEFT JOIN entity_containers ec ON ec.id = p.container_id
      LEFT JOIN entity_details ed ON ed.entity_container_id = p.container_id
      LEFT JOIN entity_ratings er
        ON er.entity_container_id = p.container_id
       AND er.user_id::text = $3::text
      LEFT JOIN LATERAL (
        SELECT emi.public_url
        FROM entity_media_items emi
        WHERE emi.entity_container_id = p.container_id
          AND emi.user_id::text = $3::text
        ORDER BY emi.position ASC, emi.created_at ASC
        LIMIT 1
      ) media ON TRUE
      LEFT JOIN collections c ON c.id = COALESCE(p.collection_id, ec.collection_id)
      WHERE COALESCE(ec.status, 'active') = 'active'
        AND ($5::double precision IS NULL OR ST_DistanceSphere(p.location, te.anchor_geom) <= $5::double precision)
        AND ($6::integer IS NULL OR er.value >= $6::integer)
      ORDER BY
        CASE WHEN er.value IS NULL THEN 1 ELSE 0 END ASC,
        er.value DESC NULLS LAST,
        ST_DistanceSphere(p.location, te.anchor_geom) ASC,
        p.created_at ASC
      LIMIT $4
    `,
    [entityId, entityType, userId, limit, radiusMeters, minRating]
  );

  return rows.map((row) => ({
    id: row.id,
    containerId: row.container_id,
    title: row.title,
    collectionId: row.collection_id,
    collectionName: row.collection_name,
    collectionColor: row.collection_color,
    imageUrl: row.image_url,
    rating: row.rating,
    distanceMeters: Number(row.distance_meters ?? 0),
    coordinates: {
      lng: Number(row.lng),
      lat: Number(row.lat),
    },
  }));
}

// ── Generated Widgets ────────────────────────────────────────────────────────

export interface GeneratedWidgetRecord {
  id: string;
  widgetKey: string;
  name: string;
  description: string | null;
  componentCode: string;
  ports: Array<{ portKey: string; direction: string; valueType: string; label: string }>;
  status: "draft" | "active" | "archived";
  targetHosts: string[];
  createdAt: string;
}

export async function saveGeneratedWidget(params: {
  widgetKey: string;
  name: string;
  description: string;
  componentCode: string;
  ports: GeneratedWidgetRecord["ports"];
  targetHosts?: string[];
  chatHistory: Array<{ role: string; content: string }>;
}): Promise<GeneratedWidgetRecord> {
  const userId = await getUserId();

  const { rows } = await pool.query<{
    id: string;
    widget_key: string;
    name: string;
    description: string | null;
    component_code: string;
    ports: GeneratedWidgetRecord["ports"];
    status: "draft" | "active" | "archived";
    target_hosts: string[];
    created_at: string;
  }>(
    `INSERT INTO generated_widgets
       (user_id, widget_key, name, description, component_code, ports, target_hosts, chat_history)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8::jsonb)
     ON CONFLICT (user_id, widget_key)
     DO UPDATE SET
       name = EXCLUDED.name,
       description = EXCLUDED.description,
       component_code = EXCLUDED.component_code,
       ports = EXCLUDED.ports,
       target_hosts = EXCLUDED.target_hosts,
       chat_history = EXCLUDED.chat_history,
       status = 'active',
       updated_at = NOW()
     RETURNING id, widget_key, name, description, component_code, ports, status, target_hosts, created_at`,
    [
      userId,
      params.widgetKey,
      params.name,
      params.description,
      params.componentCode,
      JSON.stringify(params.ports),
      params.targetHosts ?? [],
      JSON.stringify(params.chatHistory),
    ]
  );

  const row = rows[0];
  return {
    id: row.id,
    widgetKey: row.widget_key,
    name: row.name,
    description: row.description,
    componentCode: row.component_code,
    ports: row.ports,
    status: row.status,
    targetHosts: row.target_hosts ?? [],
    createdAt: row.created_at,
  };
}

export async function getGeneratedWidgets(): Promise<GeneratedWidgetRecord[]> {
  const userId = await getUserId();

  const { rows } = await pool.query<{
    id: string;
    widget_key: string;
    name: string;
    description: string | null;
    component_code: string;
    ports: GeneratedWidgetRecord["ports"];
    status: "draft" | "active" | "archived";
    target_hosts: string[];
    created_at: string;
  }>(
    `SELECT id, widget_key, name, description, component_code, ports, status, target_hosts, created_at
     FROM generated_widgets
     WHERE user_id = $1 AND status != 'archived'
     ORDER BY created_at DESC`,
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    widgetKey: row.widget_key,
    name: row.name,
    description: row.description,
    componentCode: row.component_code,
    ports: row.ports,
    status: row.status,
    targetHosts: row.target_hosts ?? [],
    createdAt: row.created_at,
  }));
}

export async function placeGeneratedWidget(id: string, hosts: string[]): Promise<void> {
  const userId = await getUserId();
  await pool.query(
    `UPDATE generated_widgets SET target_hosts = $1, status = 'active', updated_at = NOW()
     WHERE id = $2 AND user_id = $3`,
    [hosts, id, userId]
  );
}

export async function getGeneratedWidgetsForHost(host: string): Promise<GeneratedWidgetRecord[]> {
  const userId = await getUserId();
  const { rows } = await pool.query<{
    id: string;
    widget_key: string;
    name: string;
    description: string | null;
    component_code: string;
    ports: GeneratedWidgetRecord["ports"];
    status: "draft" | "active" | "archived";
    target_hosts: string[];
    created_at: string;
  }>(
    `SELECT id, widget_key, name, description, component_code, ports, status, target_hosts, created_at
     FROM generated_widgets
     WHERE user_id = $1 AND status != 'archived' AND $2 = ANY(target_hosts)
     ORDER BY created_at DESC`,
    [userId, host]
  );

  return rows.map((row) => ({
    id: row.id,
    widgetKey: row.widget_key,
    name: row.name,
    description: row.description,
    componentCode: row.component_code,
    ports: row.ports,
    status: row.status,
    targetHosts: row.target_hosts ?? [],
    createdAt: row.created_at,
  }));
}

export async function archiveGeneratedWidget(id: string): Promise<void> {
  const userId = await getUserId();
  await pool.query(
    `UPDATE generated_widgets SET status = 'archived', updated_at = NOW()
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
}

// --- COLLECTION EXPORT / IMPORT ---

export async function exportCollection(collectionId: string): Promise<CollectionExportData> {
  const userId = await getUserId();

  const { rows: colRows } = await pool.query<{ name: string; color: string; icon: string }>(
    `SELECT name, color, icon FROM collections WHERE id = $1::uuid AND user_id = $2 LIMIT 1`,
    [collectionId, userId]
  );
  if (!colRows[0]) throw new Error("Collection not found.");
  const col = colRows[0];

  const [pinRows, traceRows, areaRows] = await Promise.all([
    pool.query<{ container_id: string | null; title: string; lng: number; lat: number }>(
      `SELECT p.container_id,
              COALESCE(ed.title, p.name, 'Untitled Pin') AS title,
              ST_X(p.location::geometry) AS lng,
              ST_Y(p.location::geometry) AS lat
       FROM pins p
       LEFT JOIN entity_containers ec ON ec.id = p.container_id
       LEFT JOIN entity_details ed ON ed.entity_container_id = p.container_id
       WHERE COALESCE(p.collection_id, ec.collection_id) = $1::uuid
         AND p.user_id = $2
         AND COALESCE(ec.status, 'active') = 'active'`,
      [collectionId, userId]
    ),
    pool.query<{ container_id: string | null; title: string; path: { coordinates: [number, number][] } }>(
      `SELECT t.container_id,
              COALESCE(ed.title, t.name, 'Untitled Path') AS title,
              ST_AsGeoJSON(t.path)::json AS path
       FROM traces t
       LEFT JOIN entity_containers ec ON ec.id = t.container_id
       LEFT JOIN entity_details ed ON ed.entity_container_id = t.container_id
       WHERE COALESCE(t.collection_id, ec.collection_id) = $1::uuid
         AND t.user_id = $2
         AND COALESCE(ec.status, 'active') = 'active'`,
      [collectionId, userId]
    ),
    pool.query<{ container_id: string | null; title: string; path: { coordinates: [[number, number][]] } }>(
      `SELECT a.container_id,
              COALESCE(ed.title, a.name, 'Untitled Zone') AS title,
              ST_AsGeoJSON(a.path)::json AS path
       FROM areas a
       LEFT JOIN entity_containers ec ON ec.id = a.container_id
       LEFT JOIN entity_details ed ON ed.entity_container_id = a.container_id
       WHERE COALESCE(a.collection_id, ec.collection_id) = $1::uuid
         AND a.user_id = $2
         AND COALESCE(ec.status, 'active') = 'active'`,
      [collectionId, userId]
    ),
  ]);

  const containerIds = [
    ...pinRows.rows.map((r) => r.container_id),
    ...traceRows.rows.map((r) => r.container_id),
    ...areaRows.rows.map((r) => r.container_id),
  ].filter((id): id is string => id !== null);

  const [notesResult, resourcesResult, mediaResult, ratingsResult] = containerIds.length > 0
    ? await Promise.all([
        pool.query<{ containerId: string; title: string | null; bodyMarkdown: string }>(
          `SELECT entity_container_id AS "containerId", title, body_markdown AS "bodyMarkdown"
           FROM entity_story_entries
           WHERE entity_container_id = ANY($1::uuid[]) AND user_id = $2
           ORDER BY position ASC`,
          [containerIds, userId]
        ),
        pool.query<{ containerId: string; label: string | null; url: string }>(
          `SELECT entity_container_id AS "containerId", label, url
           FROM entity_resource_links
           WHERE entity_container_id = ANY($1::uuid[]) AND user_id = $2
           ORDER BY position ASC`,
          [containerIds, userId]
        ),
        pool.query<{ containerId: string; url: string; caption: string | null }>(
          `SELECT entity_container_id AS "containerId", public_url AS url, caption
           FROM entity_media_items
           WHERE entity_container_id = ANY($1::uuid[]) AND user_id = $2
           ORDER BY position ASC`,
          [containerIds, userId]
        ),
        pool.query<{ containerId: string; value: number }>(
          `SELECT entity_container_id AS "containerId", value
           FROM entity_ratings
           WHERE entity_container_id = ANY($1::uuid[]) AND user_id = $2`,
          [containerIds, userId]
        ),
      ])
    : [{ rows: [] as { containerId: string; title: string | null; bodyMarkdown: string }[] },
       { rows: [] as { containerId: string; label: string | null; url: string }[] },
       { rows: [] as { containerId: string; url: string; caption: string | null }[] },
       { rows: [] as { containerId: string; value: number }[] }];

  const notesByContainer = new Map<string, CollectionExportNote[]>();
  for (const r of notesResult.rows) {
    const arr = notesByContainer.get(r.containerId) ?? [];
    arr.push({ title: r.title ?? null, markdown: r.bodyMarkdown });
    notesByContainer.set(r.containerId, arr);
  }

  const resourcesByContainer = new Map<string, CollectionExportResource[]>();
  for (const r of resourcesResult.rows) {
    const arr = resourcesByContainer.get(r.containerId) ?? [];
    arr.push({ label: r.label ?? null, url: r.url });
    resourcesByContainer.set(r.containerId, arr);
  }

  const mediaByContainer = new Map<string, CollectionExportMedia[]>();
  for (const r of mediaResult.rows) {
    const arr = mediaByContainer.get(r.containerId) ?? [];
    arr.push({ url: r.url, caption: r.caption ?? null });
    mediaByContainer.set(r.containerId, arr);
  }

  const ratingByContainer = new Map<string, number>();
  for (const r of ratingsResult.rows) {
    ratingByContainer.set(r.containerId, r.value);
  }

  function getEnrichments(containerId: string | null) {
    return {
      notes: containerId ? (notesByContainer.get(containerId) ?? []) : [],
      resources: containerId ? (resourcesByContainer.get(containerId) ?? []) : [],
      mediaUrls: containerId ? (mediaByContainer.get(containerId) ?? []) : [],
      rating: containerId ? (ratingByContainer.get(containerId) ?? null) : null,
    };
  }

  const entities: CollectionExportEntity[] = [
    ...pinRows.rows.map((r) => ({
      type: "pin" as const,
      title: r.title,
      coordinates: { lng: Number(r.lng), lat: Number(r.lat) },
      ...getEnrichments(r.container_id),
    })),
    ...traceRows.rows.map((r) => ({
      type: "trace" as const,
      title: r.title,
      coordinates: (r.path?.coordinates ?? []).map(([lng, lat]) => ({ lng, lat })),
      ...getEnrichments(r.container_id),
    })),
    ...areaRows.rows.map((r) => ({
      type: "area" as const,
      title: r.title,
      coordinates: (r.path?.coordinates?.[0] ?? []).map(([lng, lat]) => ({ lng, lat })),
      ...getEnrichments(r.container_id),
    })),
  ];

  return {
    format: COLLECTION_EXPORT_FORMAT,
    version: COLLECTION_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    collection: { name: col.name, color: col.color, icon: col.icon },
    entities,
  };
}

async function insertImportEnrichments(
  client: PoolClient,
  containerId: string,
  userId: string,
  entity: CollectionExportEntity
) {
  if (entity.rating !== null && entity.rating !== undefined) {
    await client.query(
      `INSERT INTO entity_ratings (entity_container_id, user_id, value)
       VALUES ($1, $2, $3)
       ON CONFLICT (entity_container_id) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [containerId, userId, entity.rating]
    );
  }
  for (const [i, note] of entity.notes.entries()) {
    await client.query(
      `INSERT INTO entity_story_entries (entity_container_id, user_id, title, body_markdown, position)
       VALUES ($1, $2, $3, $4, $5)`,
      [containerId, userId, note.title ?? null, note.markdown, i]
    );
  }
  for (const [i, resource] of entity.resources.entries()) {
    await client.query(
      `INSERT INTO entity_resource_links (entity_container_id, user_id, label, url, position)
       VALUES ($1, $2, $3, $4, $5)`,
      [containerId, userId, resource.label ?? null, resource.url, i]
    );
  }
}

export async function importCollection(data: CollectionExportData) {
  const userId = await getUserId();

  const typeCounts: Record<string, number> = {};
  for (const e of data.entities) typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1;
  const collectionType =
    (typeCounts.trace ?? 0) > (typeCounts.pin ?? 0) && (typeCounts.trace ?? 0) > (typeCounts.area ?? 0)
      ? "trace"
      : (typeCounts.area ?? 0) > (typeCounts.pin ?? 0)
        ? "area"
        : "pin";

  const { rows: colRows } = await pool.query<{ id: string }>(
    `INSERT INTO collections (name, color, icon, user_id, type) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [data.collection.name, data.collection.color, data.collection.icon || "📍", userId, collectionType]
  );
  const collectionId = colRows[0].id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const entity of data.entities) {
      if (entity.type === "pin") {
        const containerId = await createEntityContainerRecord(client, {
          entityType: "pin",
          geometryKind: "point",
          collectionId,
          userId,
          sourcePayload: { source: "import", coordinates: entity.coordinates },
        });
        await upsertEntityDetails(client, { entityContainerId: containerId, userId, title: entity.title, description: "" });
        await client.query(
          `INSERT INTO pins (container_id, collection_id, name, location, user_id)
           VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6)`,
          [containerId, collectionId, entity.title, entity.coordinates.lng, entity.coordinates.lat, userId]
        );
        await insertImportEnrichments(client, containerId, userId, entity);
      } else if (entity.type === "trace") {
        const coords = (entity.coordinates as Array<{ lng: number; lat: number }>).map(
          (c) => [c.lng, c.lat] as [number, number]
        );
        const wkt = coordinatesToLineStringWkt(coords);
        const containerId = await createEntityContainerRecord(client, {
          entityType: "trace",
          geometryKind: "line",
          collectionId,
          userId,
          sourcePayload: { source: "import", coordinates: coords },
        });
        await upsertEntityDetails(client, { entityContainerId: containerId, userId, title: entity.title, description: "" });
        await client.query(
          `INSERT INTO traces (container_id, collection_id, name, path, color, user_id)
           VALUES ($1, $2, $3, ST_SetSRID($4::geometry, 4326), $5, $6)`,
          [containerId, collectionId, entity.title, wkt, data.collection.color, userId]
        );
        await insertImportEnrichments(client, containerId, userId, entity);
      } else if (entity.type === "area") {
        const coords = (entity.coordinates as Array<{ lng: number; lat: number }>).map(
          (c) => [c.lng, c.lat] as [number, number]
        );
        const safeCoords = [...coords];
        if (safeCoords.length >= 3) {
          const first = safeCoords[0];
          const last = safeCoords[safeCoords.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) safeCoords.push([...first]);
        }
        const wkt = `POLYGON((${safeCoords.map((c) => `${c[0]} ${c[1]}`).join(", ")}))`;
        const containerId = await createEntityContainerRecord(client, {
          entityType: "area",
          geometryKind: "polygon",
          collectionId,
          userId,
          sourcePayload: { source: "import", coordinates: safeCoords },
        });
        await upsertEntityDetails(client, { entityContainerId: containerId, userId, title: entity.title, description: "" });
        await client.query(
          `INSERT INTO areas (container_id, collection_id, name, path, color, user_id)
           VALUES ($1, $2, $3, ST_SetSRID($4::geometry, 4326), $5, $6)`,
          [containerId, collectionId, entity.title, wkt, data.collection.color, userId]
        );
        await insertImportEnrichments(client, containerId, userId, entity);
      }
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return {
    id: collectionId,
    name: data.collection.name,
    color: data.collection.color,
    icon: data.collection.icon || "📍",
    itemCount: data.entities.length,
  };
}
