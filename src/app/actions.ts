"use server";

import type { PoolClient } from "pg";
import { pool } from "@/lib/db";
import { auth } from "@/auth";
import type { WidgetComponentKey, WidgetDefinitionRecord, WidgetEntityPayload, WidgetEntityType, WidgetInstanceRecord, WidgetLayerType } from "@/lib/widgets";
import type { WidgetPlacementRecord } from "@/lib/widgets";
import type { LeftSidebarShellInstance, TopChromeShellInstance } from "@/lib/shells";
import { defaultLeftSidebarShellConfig, defaultShellState, defaultTopChromeShellConfig } from "@/lib/shells";
import { validateImageUpload } from "@/lib/security";
import { deleteUploadFromUrl, writeUpload } from "@/lib/storage";
import { assertRateLimit } from "@/lib/rate-limit";

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
    supportedEntityTypes: ["pin"],
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
    supportedEntityTypes: ["pin"],
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
    supportedEntityTypes: ["trace"],
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
      slug: "pin_entity_shell",
      name: "Pin Entity Shell",
      config: {
        version: 1,
        placement: "right",
        sizePreset: "regular",
        width: 376,
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
        width: 376,
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
        width: 376,
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
        width: 376,
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

async function ensureUserShellInstance(userId: string, slug: "left_sidebar" | "top_chrome") {
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

const getEntityShellSlug = (entityType: WidgetEntityType) => {
  if (entityType === "trace") {
    return "trace_entity_shell";
  }

  if (entityType === "area") {
    return "area_entity_shell";
  }

  return "pin_entity_shell";
};

async function ensureEntityShellInstance(entityType: WidgetEntityType, entityId: string) {
  await ensureShellDefinitionSeed();

  const slug = getEntityShellSlug(entityType);

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
    [entityId, slug]
  );
}

async function ensureDefaultShellWidgets(userId: string, shellSlug: "left_sidebar" | "top_chrome") {
  await ensureWidgetLibrarySeed();
  await ensureUserShellInstance(userId, shellSlug);

  const desiredWidgets =
    shellSlug === "top_chrome"
      ? ([{ slug: "shell_chrome_primary", position: 0 }] as const)
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
          VALUES ($1, $2::uuid, 'main', $3)
          RETURNING id
        `,
        [shellInstanceId, widgetInstanceId, nextInsertPosition]
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

export async function getLeftSidebarShell(): Promise<LeftSidebarShellInstance> {
  const userId = await getUserId();
  await ensureUserShellInstance(userId, "left_sidebar");

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
        AND si.owner_id = $1
        AND sd.slug = 'left_sidebar'
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] as LeftSidebarShellInstance;
}

export async function getTopChromeShell(): Promise<TopChromeShellInstance> {
  const userId = await getUserId();
  await ensureUserShellInstance(userId, "top_chrome");

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
        AND si.owner_id = $1
        AND sd.slug = 'top_chrome'
      LIMIT 1
    `,
    [userId]
  );

  return rows[0] as TopChromeShellInstance;
}

export async function getLeftSidebarShellWidgets() {
  const userId = await getUserId();
  await ensureDefaultShellWidgets(userId, "left_sidebar");

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
        AND si.owner_id = $1
        AND sd.slug = 'left_sidebar'
      ORDER BY wp.position ASC, wp.created_at ASC
    `,
    [userId]
  );

  return rows as Array<WidgetPlacementRecord & WidgetInstanceRecord>;
}

export async function getTopChromeShellWidgets() {
  const userId = await getUserId();
  await ensureDefaultShellWidgets(userId, "top_chrome");

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
        wi.state
      FROM widget_placements wp
      INNER JOIN widget_instances wi ON wi.id = wp.widget_instance_id
      INNER JOIN widget_definitions wd ON wd.id = wi.definition_id
      INNER JOIN shell_instances si ON si.id = wp.shell_instance_id
      INNER JOIN shell_definitions sd ON sd.id = si.definition_id
      WHERE si.owner_type = 'user'
        AND si.owner_id = $1
        AND sd.slug = 'top_chrome'
      ORDER BY wp.position ASC, wp.created_at ASC
    `,
    [userId]
  );

  return rows as Array<WidgetPlacementRecord & WidgetInstanceRecord>;
}

export async function updateLeftSidebarShellState(partialState: Partial<LeftSidebarShellInstance["state"]>) {
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
      `${selectQuery} WHERE c.user_id = $1 AND c.type = $2 ORDER BY c.created_at DESC`,
      [userId, type]
    );
    return rows;
  }
  const { rows } = await pool.query(
    `${selectQuery} WHERE c.user_id = $1 ORDER BY c.created_at DESC`,
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
    SELECT p.id, p.container_id, COALESCE(p.collection_id, ec.collection_id) as collection_id, p.name, p.note, p.image_url,
           c.color as "collectionColor",
           c.icon as "collectionIcon",
           ST_AsGeoJSON(p.location)::json as location
    FROM pins p
    LEFT JOIN entity_containers ec ON ec.id = p.container_id
    LEFT JOIN collections c ON c.id = COALESCE(p.collection_id, ec.collection_id)
    WHERE p.user_id = $1
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
        lng,
        lat,
        name: name || null,
      },
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
  const userId = await getUserId();
  // TEMP(tech-debt): title/note/image still live directly on pins during the transition
  // to canonical container + enrichment records. Keep this write path narrow and field-local.
  const normalizedName = name.trim() || "Untitled Marker";
  const { rows } = await pool.query(
    `
      UPDATE pins
      SET name = $1,
          note = $2,
          image_url = $3
      WHERE id = $4
        AND user_id = $5
      RETURNING id, name
    `,
    [normalizedName, note, imageUrl, id, userId]
  );
  return rows[0];
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
    SELECT t.id, t.container_id, t.name, t.color,
           COALESCE(
             t.collection_id,
             ec.collection_id,
             ${traceFallbackCollectionIdSql}
           ) as collection_id,
           c.color as "collectionColor",
           ST_AsGeoJSON(t.path)::json as path 
    FROM traces t
    LEFT JOIN entity_containers ec ON ec.id = t.container_id
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

export async function saveTrace(coordinates: [number, number][], color: string, collectionId?: string) {
  const userId = await getUserId();
  const wktPoints = coordinates.map(c => `${c[0]} ${c[1]}`).join(', ');
  const wkt = `LINESTRING(${wktPoints})`;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const containerId = await createEntityContainerRecord(client, {
      entityType: "trace",
      geometryKind: "line",
      collectionId: collectionId || null,
      userId,
      sourcePayload: {
        coordinates,
        color,
      },
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
  const wktPoints = coordinates.map(c => `${c[0]} ${c[1]}`).join(', ');
  const wkt = `LINESTRING(${wktPoints})`;
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
    SELECT a.id, a.container_id, a.name, a.color,
           COALESCE(
             a.collection_id,
             ec.collection_id,
             ${areaFallbackCollectionIdSql}
           ) as collection_id,
           c.color as "collectionColor",
           ST_AsGeoJSON(a.path)::json as path 
    FROM areas a
    LEFT JOIN entity_containers ec ON ec.id = a.container_id
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
        coordinates: safeCoords,
        color,
      },
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

async function ensureDefaultEntityWidget(userId: string, entityType: WidgetEntityType, entityId: string) {
  await ensureWidgetLibrarySeed();
  await ensureEntityShellInstance(entityType, entityId);

  const defaultEntityWidgets = [
    { slug: "entity_info", position: 0 },
    { slug: "entity_rating", position: 10 },
    { slug: "entity_resources", position: 20 },
    { slug: "entity_stories", position: 30 },
    { slug: "entity_gallery", position: 40 },
    { slug: "entity_nearby_pins", position: 50 },
    { slug: "entity_transport_mode", position: 60 },
    { slug: "entity_delete", position: 99 },
  ];

  for (const widget of defaultEntityWidgets) {
    await pool.query(
      `
        INSERT INTO widget_instances (definition_id, layer, entity_type, entity_id, position, title, user_id)
        SELECT d.id, 'entity', $2, $3::uuid, $4, d.name, $1
        FROM widget_definitions d
        WHERE d.slug = $5
          AND $2 = ANY(d.supported_entity_types)
        AND NOT EXISTS (
          SELECT 1
          FROM widget_instances wi
          WHERE wi.user_id = $1
            AND wi.layer = 'entity'
            AND wi.entity_type = $2
            AND wi.entity_id = $3::uuid
            AND wi.definition_id = d.id
        )
      `,
      [userId, entityType, entityId, widget.position, widget.slug]
    );
  }

  await pool.query(
    `
      WITH entity_shell AS (
        SELECT si.id
        FROM shell_instances si
        INNER JOIN shell_definitions sd ON sd.id = si.definition_id
        WHERE si.owner_type = 'entity'
          AND si.owner_id = $2
          AND sd.slug = $3
        LIMIT 1
      )
      INSERT INTO widget_placements (shell_instance_id, widget_instance_id, slot, position)
      SELECT entity_shell.id, wi.id, 'main', wi.position
      FROM widget_instances wi
      CROSS JOIN entity_shell
      WHERE wi.user_id = $1
        AND wi.layer = 'entity'
        AND wi.entity_type = $4
        AND wi.entity_id = $2::uuid
        AND NOT EXISTS (
          SELECT 1
          FROM widget_placements wp
          WHERE wp.widget_instance_id = wi.id
        )
    `,
    [userId, entityId, getEntityShellSlug(entityType), entityType]
  );
}

export async function getGlobalWidgets() {
  const userId = await getUserId();
  await ensureDefaultGlobalWidgets(userId);

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

export async function getEntityWidgets(entityType: WidgetEntityType, entityId: string) {
  const userId = await getUserId();
  await ensureDefaultEntityWidget(userId, entityType, entityId);

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
        AND wi.layer = 'entity'
        AND wi.entity_type = $2
        AND wi.entity_id = $3::uuid
        AND si.owner_type = 'entity'
        AND si.owner_id = $3::text
        AND sd.slug = $4
      ORDER BY wp.position ASC, wp.created_at ASC
    `,
    [userId, entityType, entityId, getEntityShellSlug(entityType)]
  );

  return rows as WidgetInstanceRecord[];
}

export async function moveEntityWidgetHost(
  entityType: WidgetEntityType,
  entityId: string,
  widgetId: string,
  targetHost: "pin_entity_shell" | "left_sidebar"
) {
  const userId = await getUserId();

  if (entityType !== "pin") {
    throw new Error("Entity host move is currently supported only for pin widgets.");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const widgetResult = await client.query(
      `
        SELECT wi.id
        FROM widget_instances wi
        WHERE wi.user_id = $1
          AND wi.layer = 'entity'
          AND wi.entity_type = $2
          AND wi.entity_id = $3::uuid
          AND wi.id = $4::uuid
        LIMIT 1
      `,
      [userId, entityType, entityId, widgetId]
    );

    if (widgetResult.rowCount === 0) {
      throw new Error("Entity widget not found.");
    }

    const shellResult = await client.query(
      `
        SELECT si.id
        FROM shell_instances si
        INNER JOIN shell_definitions sd ON sd.id = si.definition_id
        WHERE si.owner_type = 'user'
          AND si.owner_id = $1
          AND sd.slug = 'left_sidebar'
        LIMIT 1
      `,
      [userId]
    );

    const leftShellId = shellResult.rows[0]?.id as string | undefined;

    if (!leftShellId) {
      throw new Error("Left sidebar shell not found.");
    }

    const entityShellResult = await client.query(
      `
        SELECT si.id
        FROM shell_instances si
        INNER JOIN shell_definitions sd ON sd.id = si.definition_id
        WHERE si.owner_type = 'entity'
          AND si.owner_id = $1
          AND sd.slug = $2
        LIMIT 1
      `,
      [entityId, getEntityShellSlug(entityType)]
    );

    const entityShellId = entityShellResult.rows[0]?.id as string | undefined;

    if (!entityShellId) {
      throw new Error("Entity shell not found.");
    }

    if (targetHost === "left_sidebar") {
      await client.query(
        `
          DELETE FROM widget_placements
          WHERE widget_instance_id = $1::uuid
        `,
        [widgetId]
      );

      await client.query(
        `
          WITH next_position AS (
            SELECT COALESCE(MAX(position), -1) + 1 AS value
            FROM widget_placements
            WHERE shell_instance_id = $1
          )
          INSERT INTO widget_placements (
            shell_instance_id,
            widget_instance_id,
            slot,
            position
          )
          SELECT $1, $2::uuid, 'main', next_position.value
          FROM next_position
        `,
        [leftShellId, widgetId]
      );
    } else {
      await client.query(
        `
          DELETE FROM widget_placements
          WHERE widget_instance_id = $1::uuid
        `,
        [widgetId]
      );

      await client.query(
        `
          WITH next_position AS (
            SELECT COALESCE(MAX(position), -1) + 1 AS value
            FROM widget_placements
            WHERE shell_instance_id = $1
          )
          INSERT INTO widget_placements (
            shell_instance_id,
            widget_instance_id,
            slot,
            position
          )
          SELECT $1, $2::uuid, 'main', next_position.value
          FROM next_position
        `,
        [entityShellId, widgetId]
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
          AND wi.entity_type = $2
          AND wi.entity_id = $3::uuid
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
          AND entity_type = $2
          AND entity_id = $3::uuid
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
            AND entity_type = $2
            AND entity_id = $3::uuid
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

export async function getEntityWidgetPayload(entityType: WidgetEntityType, entityId: string) {
  const userId = await getUserId();
  const { table, geometryKind } = mapEntityTable(entityType);

  // TEMP(tech-debt): entity widget payload still pulls some fields from legacy entity tables
  // until canonical entity containers + enrichment records are introduced.
  const selectImage = entityType === "pin" ? "e.image_url" : "NULL";
  const selectDescription = entityType === "pin" ? "e.note" : "NULL";

  const { rows } = await pool.query(
    `
      SELECT
        e.id,
        e.container_id as "containerId",
        $1::text as type,
        COALESCE(e.name, CONCAT('Untitled ', INITCAP($1::text))) as title,
        c.name as subtitle,
        ${selectDescription} as description,
        ${selectImage} as "imageUrl",
        c.id as "collectionId",
        c.name as "collectionName",
        c.color as "collectionColor",
        c.type as "collectionType"
      FROM ${table} e
      LEFT JOIN collections c ON c.id = e.collection_id
      WHERE e.id = $2::uuid
        AND e.user_id = $3
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
