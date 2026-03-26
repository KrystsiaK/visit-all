export type ShellSlug = "left_sidebar" | "top_chrome";
export type ShellKind = "panel";
export type ShellScope = "app";
export type ShellOwnerType = "user";
export type ShellPlacement = "left" | "right" | "bottom" | "center" | "floating";
export type ShellSizePreset = "compact" | "regular" | "wide";
export type ShellMotionPreset = "sidebar-soft" | "overlay-soft";

export interface LeftSidebarShellSections {
  search: boolean;
  modeSwitch: boolean;
  collections: boolean;
  controls: boolean;
  actions: boolean;
}

export interface LeftSidebarShellConfig {
  version: 1;
  placement: "left";
  sizePreset: ShellSizePreset;
  width: number;
  motionPreset: "sidebar-soft";
  sections: LeftSidebarShellSections;
}

export interface TopChromeShellConfig {
  version: 1;
  placement: "left";
  sizePreset: "compact";
  width: number;
  motionPreset: "overlay-soft";
  anchored: true;
}

export interface ShellStateRecord {
  hidden: boolean;
  collapsed: boolean;
}

export interface ShellInstanceRecord<
  TConfig extends object = Record<string, unknown>,
  TState extends object = Record<string, unknown>,
> {
  id: string;
  slug: ShellSlug | string;
  name: string;
  kind: ShellKind | string;
  scope: ShellScope | string;
  ownerType: ShellOwnerType | string;
  ownerId: string;
  config: TConfig;
  state: TState;
}

export const defaultLeftSidebarShellConfig: LeftSidebarShellConfig = {
  version: 1,
  placement: "left",
  sizePreset: "regular",
  width: 360,
  motionPreset: "sidebar-soft",
  sections: {
    search: true,
    modeSwitch: true,
    collections: true,
    controls: true,
    actions: true,
  },
};

export const defaultTopChromeShellConfig: TopChromeShellConfig = {
  version: 1,
  placement: "left",
  sizePreset: "compact",
  width: 360,
  motionPreset: "overlay-soft",
  anchored: true,
};

export const defaultShellState: ShellStateRecord = {
  hidden: false,
  collapsed: false,
};

export type LeftSidebarShellInstance = ShellInstanceRecord<
  LeftSidebarShellConfig,
  ShellStateRecord
>;

export type TopChromeShellInstance = ShellInstanceRecord<
  TopChromeShellConfig,
  ShellStateRecord
>;
