import { createWidgetRegistry, defineWidget } from "@synarava/wiring-engine";

import { EntityDeleteWidgetCard } from "@/modules/entity/widgets/EntityDeleteWidgetCard";
import { EntityGalleryWidgetCard } from "@/modules/entity/widgets/EntityGalleryWidgetCard";
import { EntityInfoWidgetCard } from "@/modules/entity/widgets/EntityInfoWidgetCard";
import { EntityNearbyPinsWidgetCard } from "@/modules/entity/widgets/EntityNearbyPinsWidgetCard";
import { EntityRatingWidgetCard } from "@/modules/entity/widgets/EntityRatingWidgetCard";
import { EntityResourcesWidgetCard } from "@/modules/entity/widgets/EntityResourcesWidgetCard";
import { EntityStoriesWidgetCard } from "@/modules/entity/widgets/EntityStoriesWidgetCard";
import { GlobalOverviewWidgetCard } from "@/components/widgets/global-widgets/GlobalOverviewWidgetCard";
import { UserAccountActionsWidgetCard } from "@/components/widgets/user-widgets/UserAccountActionsWidgetCard";
import { UserProfileWidgetCard } from "@/components/widgets/user-widgets/UserProfileWidgetCard";
import { leftShellWidgetDefinitions } from "@/modules/shell/wiring/left-shell-widget-definitions";

const appWidgetDefinitions = [
  ...leftShellWidgetDefinitions,
  defineWidget({ key: "global_overview", name: "Global Overview", ports: [], Component: GlobalOverviewWidgetCard }),
  defineWidget({ key: "entity_info", name: "Entity Info", ports: [], Component: EntityInfoWidgetCard }),
  defineWidget({ key: "entity_delete", name: "Delete Entity", ports: [], Component: EntityDeleteWidgetCard }),
  defineWidget({ key: "entity_gallery", name: "Entity Gallery", ports: [], Component: EntityGalleryWidgetCard }),
  defineWidget({
    key: "entity_nearby_pins",
    name: "Nearby Pins",
    description: "Surfaces related places near the active entity. Emits fly-to commands when a pin is opened.",
    ports: [
      { portKey: "fly_to_out", direction: "output", valueType: "json", label: "Fly To" },
    ],
    Component: EntityNearbyPinsWidgetCard,
    ui: { color: "#2f62ff", icon: "map-pin" },
  }),
  defineWidget({ key: "entity_rating", name: "Entity Rating", ports: [], Component: EntityRatingWidgetCard }),
  defineWidget({ key: "entity_resources", name: "Entity Resources", ports: [], Component: EntityResourcesWidgetCard }),
  defineWidget({ key: "entity_stories", name: "Entity Stories", ports: [], Component: EntityStoriesWidgetCard }),
  defineWidget({ key: "user_profile", name: "User Profile", ports: [], Component: UserProfileWidgetCard }),
  defineWidget({ key: "user_account_actions", name: "Account Actions", ports: [], Component: UserAccountActionsWidgetCard }),
];

export const appWidgetRegistry = createWidgetRegistry().registerMany(appWidgetDefinitions);
