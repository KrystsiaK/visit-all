import { describe, expect, it } from "vitest";
import {
  createLayerVisibilityState,
  getInvisibleCollectionIdsFromState,
  getLayerVisibilityFlags,
  getMutedCollectionIds,
  getSoloCollectionIds,
  hasAnySolo,
  isLayerVisible,
  layerVisibilityReducer,
} from "../../src/lib/layer-visibility";

const collections = [{ id: "a" }, { id: "b" }, { id: "c" }];

function reduceActions(...actions: Parameters<typeof layerVisibilityReducer>[1][]) {
  return actions.reduce(
    (state, action) => layerVisibilityReducer(state, action),
    createLayerVisibilityState(collections.map((collection) => collection.id))
  );
}

describe("layer visibility reducer", () => {
  it("starts with all layers visible, unmuted, and not soloed", () => {
    const state = createLayerVisibilityState(["a", "b", "c"]);

    expect(hasAnySolo(state)).toBe(false);
    expect(getMutedCollectionIds(state)).toEqual([]);
    expect(getSoloCollectionIds(state)).toEqual([]);
    expect(getInvisibleCollectionIdsFromState(collections, state)).toEqual([]);
    expect(getLayerVisibilityFlags(state, "a")).toEqual({ muted: false, solo: false });
    expect(getLayerVisibilityFlags(state, "b")).toEqual({ muted: false, solo: false });
    expect(getLayerVisibilityFlags(state, "c")).toEqual({ muted: false, solo: false });
  });

  it("toggles mute only for the targeted layer", () => {
    const mutedState = reduceActions({ type: "toggle-mute", collectionId: "b" });

    expect(getLayerVisibilityFlags(mutedState, "a")).toEqual({ muted: false, solo: false });
    expect(getLayerVisibilityFlags(mutedState, "b")).toEqual({ muted: true, solo: false });
    expect(getLayerVisibilityFlags(mutedState, "c")).toEqual({ muted: false, solo: false });
    expect(getMutedCollectionIds(mutedState)).toEqual(["b"]);

    const unmutedState = layerVisibilityReducer(mutedState, {
      type: "toggle-mute",
      collectionId: "b",
    });

    expect(getLayerVisibilityFlags(unmutedState, "b")).toEqual({ muted: false, solo: false });
    expect(getMutedCollectionIds(unmutedState)).toEqual([]);
  });

  it("toggles solo only for the targeted layer and allows multi-solo", () => {
    const state = reduceActions(
      { type: "toggle-solo", collectionId: "b" },
      { type: "toggle-solo", collectionId: "a" }
    );

    expect(getLayerVisibilityFlags(state, "a")).toEqual({ muted: false, solo: true });
    expect(getLayerVisibilityFlags(state, "b")).toEqual({ muted: false, solo: true });
    expect(getLayerVisibilityFlags(state, "c")).toEqual({ muted: false, solo: false });
    expect(getSoloCollectionIds(state)).toEqual(["a", "b"]);
  });

  it("does not disable solo on other layers automatically", () => {
    const state = reduceActions(
      { type: "toggle-solo", collectionId: "a" },
      { type: "toggle-solo", collectionId: "b" },
      { type: "toggle-solo", collectionId: "c" }
    );

    expect(getSoloCollectionIds(state)).toEqual(["a", "b", "c"]);
  });

  it("unsolos only the targeted layer from a multi-solo state", () => {
    const state = reduceActions(
      { type: "toggle-solo", collectionId: "a" },
      { type: "toggle-solo", collectionId: "b" },
      { type: "toggle-solo", collectionId: "b" }
    );

    expect(getSoloCollectionIds(state)).toEqual(["a"]);
    expect(isLayerVisible(state, "a")).toBe(true);
    expect(isLayerVisible(state, "b")).toBe(false);
    expect(isLayerVisible(state, "c")).toBe(false);
  });

  it("exits solo mode when the last solo layer is turned off", () => {
    const state = reduceActions(
      { type: "toggle-solo", collectionId: "a" },
      { type: "toggle-solo", collectionId: "a" }
    );

    expect(hasAnySolo(state)).toBe(false);
    expect(isLayerVisible(state, "a")).toBe(true);
    expect(isLayerVisible(state, "b")).toBe(true);
    expect(isLayerVisible(state, "c")).toBe(true);
  });

  it("clears solo only on the same layer when muting a soloed layer", () => {
    const state = reduceActions(
      { type: "toggle-solo", collectionId: "b" },
      { type: "toggle-mute", collectionId: "b" }
    );

    expect(getLayerVisibilityFlags(state, "b")).toEqual({ muted: true, solo: false });
    expect(getSoloCollectionIds(state)).toEqual([]);
    expect(isLayerVisible(state, "a")).toBe(true);
    expect(isLayerVisible(state, "b")).toBe(false);
    expect(isLayerVisible(state, "c")).toBe(true);
  });

  it("does not restore solo automatically when a previously soloed layer is unmuted", () => {
    const state = reduceActions(
      { type: "toggle-solo", collectionId: "b" },
      { type: "toggle-mute", collectionId: "b" },
      { type: "toggle-mute", collectionId: "b" }
    );

    expect(getLayerVisibilityFlags(state, "b")).toEqual({ muted: false, solo: false });
    expect(getSoloCollectionIds(state)).toEqual([]);
    expect(isLayerVisible(state, "b")).toBe(true);
  });

  it("keeps unrelated solo flags untouched when muting another layer", () => {
    const state = reduceActions(
      { type: "toggle-solo", collectionId: "b" },
      { type: "toggle-mute", collectionId: "a" }
    );

    expect(getLayerVisibilityFlags(state, "a")).toEqual({ muted: true, solo: false });
    expect(getLayerVisibilityFlags(state, "b")).toEqual({ muted: false, solo: true });
    expect(isLayerVisible(state, "a")).toBe(false);
    expect(isLayerVisible(state, "b")).toBe(true);
    expect(isLayerVisible(state, "c")).toBe(false);
  });

  it("keeps an unmuted layer hidden by solo mode until its own solo state changes", () => {
    const state = reduceActions(
      { type: "toggle-solo", collectionId: "b" },
      { type: "toggle-mute", collectionId: "a" },
      { type: "toggle-mute", collectionId: "a" }
    );

    expect(getLayerVisibilityFlags(state, "a")).toEqual({ muted: false, solo: false });
    expect(isLayerVisible(state, "a")).toBe(false);
    expect(isLayerVisible(state, "b")).toBe(true);
  });

  it("derives invisible collection ids for the map from the same visibility rule", () => {
    const state = reduceActions(
      { type: "toggle-solo", collectionId: "b" },
      { type: "toggle-mute", collectionId: "c" }
    );

    expect(getInvisibleCollectionIdsFromState(collections, state)).toEqual(["a", "c"]);
  });

  it("syncs new and removed collections without losing existing flags", () => {
    const state = reduceActions(
      { type: "toggle-mute", collectionId: "b" },
      { type: "sync", collectionIds: ["b", "c", "d"] }
    );

    expect(getLayerVisibilityFlags(state, "b")).toEqual({ muted: true, solo: false });
    expect(getLayerVisibilityFlags(state, "c")).toEqual({ muted: false, solo: false });
    expect(getLayerVisibilityFlags(state, "d")).toEqual({ muted: false, solo: false });
    expect(state.a).toBeUndefined();
  });

  it("reveals a layer without changing solo flags", () => {
    const state = reduceActions(
      { type: "toggle-solo", collectionId: "b" },
      { type: "toggle-mute", collectionId: "a" },
      { type: "reveal", collectionId: "a" }
    );

    expect(getLayerVisibilityFlags(state, "a")).toEqual({ muted: false, solo: false });
    expect(getLayerVisibilityFlags(state, "b")).toEqual({ muted: false, solo: true });
    expect(isLayerVisible(state, "a")).toBe(false);
    expect(isLayerVisible(state, "b")).toBe(true);
  });

  it("show only turns the same layer visible when it is currently muted", () => {
    const state = reduceActions(
      { type: "toggle-mute", collectionId: "b" },
      { type: "toggle-solo", collectionId: "b" }
    );

    expect(getLayerVisibilityFlags(state, "b")).toEqual({ muted: false, solo: true });
    expect(isLayerVisible(state, "b")).toBe(true);
  });
});
