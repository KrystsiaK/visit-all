export interface LayerVisibilityFlags {
  muted: boolean;
  solo: boolean;
}

export type LayerVisibilityState = Record<string, LayerVisibilityFlags>;

export type LayerVisibilityAction =
  | { type: "sync"; collectionIds: string[] }
  | { type: "toggle-mute"; collectionId: string }
  | { type: "toggle-solo"; collectionId: string }
  | { type: "reveal"; collectionId: string }
  | { type: "reset" };

const DEFAULT_FLAGS: LayerVisibilityFlags = {
  muted: false,
  solo: false,
};

function getNextFlags(state: LayerVisibilityState, collectionId: string): LayerVisibilityFlags {
  return state[collectionId] ?? DEFAULT_FLAGS;
}

export function createLayerVisibilityState(collectionIds: string[] = []): LayerVisibilityState {
  return collectionIds.reduce<LayerVisibilityState>((nextState, collectionId) => {
    nextState[collectionId] = { ...DEFAULT_FLAGS };
    return nextState;
  }, {});
}

export function layerVisibilityReducer(
  state: LayerVisibilityState,
  action: LayerVisibilityAction
): LayerVisibilityState {
  switch (action.type) {
    case "sync": {
      return action.collectionIds.reduce<LayerVisibilityState>((nextState, collectionId) => {
        nextState[collectionId] = { ...getNextFlags(state, collectionId) };
        return nextState;
      }, {});
    }

    case "toggle-mute": {
      const currentFlags = getNextFlags(state, action.collectionId);
      const nextMuted = !currentFlags.muted;

      return {
        ...state,
        [action.collectionId]: {
          muted: nextMuted,
          solo: nextMuted ? false : currentFlags.solo,
        },
      };
    }

    case "toggle-solo": {
      const currentFlags = getNextFlags(state, action.collectionId);
      const nextSolo = !currentFlags.solo;

      return {
        ...state,
        [action.collectionId]: {
          muted: nextSolo ? false : currentFlags.muted,
          solo: nextSolo,
        },
      };
    }

    case "reveal": {
      const currentFlags = getNextFlags(state, action.collectionId);

      return {
        ...state,
        [action.collectionId]: {
          ...currentFlags,
          muted: false,
        },
      };
    }

    case "reset":
      return Object.keys(state).reduce<LayerVisibilityState>((nextState, collectionId) => {
        nextState[collectionId] = { ...DEFAULT_FLAGS };
        return nextState;
      }, {});

    default:
      return state;
  }
}

export function getLayerVisibilityFlags(
  state: LayerVisibilityState,
  collectionId: string
): LayerVisibilityFlags {
  return getNextFlags(state, collectionId);
}

export function hasAnySolo(state: LayerVisibilityState) {
  return Object.values(state).some((flags) => flags.solo);
}

export function isLayerVisible(state: LayerVisibilityState, collectionId: string) {
  const flags = getLayerVisibilityFlags(state, collectionId);

  if (flags.muted) {
    return false;
  }

  return !hasAnySolo(state) || flags.solo;
}

export function getMutedCollectionIds(state: LayerVisibilityState) {
  return Object.entries(state)
    .filter(([, flags]) => flags.muted)
    .map(([collectionId]) => collectionId);
}

export function getSoloCollectionIds(state: LayerVisibilityState) {
  return Object.entries(state)
    .filter(([, flags]) => flags.solo)
    .map(([collectionId]) => collectionId);
}

export function getInvisibleCollectionIdsFromState<T extends { id: string }>(
  collections: T[],
  state: LayerVisibilityState
) {
  return collections
    .filter((collection) => !isLayerVisible(state, collection.id))
    .map((collection) => collection.id);
}
