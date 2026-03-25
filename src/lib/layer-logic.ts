import type { InteractionMode } from "@/app/page";

export interface LayerLike {
  id: string;
}

export type SoloCollectionIds = string[];

export function modeToCollectionType(mode: InteractionMode): string {
  if (mode === "trace" || mode === "editTrace") return "trace";
  if (mode === "area" || mode === "editArea") return "area";
  return "pin";
}

export function moveCollectionToTop<T extends LayerLike>(collections: T[], collectionId: string) {
  const nextCollections = [...collections];
  const targetIndex = nextCollections.findIndex((collection) => collection.id === collectionId);

  if (targetIndex <= 0) {
    return nextCollections;
  }

  const [selectedCollection] = nextCollections.splice(targetIndex, 1);
  nextCollections.unshift(selectedCollection);
  return nextCollections;
}

export function isCollectionVisible(
  hiddenCollectionIds: string[],
  soloCollectionIds: SoloCollectionIds,
  collectionId: string
) {
  if (hiddenCollectionIds.includes(collectionId)) {
    return false;
  }

  if (soloCollectionIds.length === 0) {
    return true;
  }

  return soloCollectionIds.includes(collectionId);
}

export function getInvisibleCollectionIds<T extends LayerLike>(
  collections: T[],
  hiddenCollectionIds: string[],
  soloCollectionIds: SoloCollectionIds
) {
  return collections
    .filter((collection) => !isCollectionVisible(hiddenCollectionIds, soloCollectionIds, collection.id))
    .map((collection) => collection.id);
}

export function toggleSoloCollectionIds(
  soloCollectionIds: SoloCollectionIds,
  collectionId: string
) {
  if (soloCollectionIds.includes(collectionId)) {
    return soloCollectionIds.filter((id) => id !== collectionId);
  }

  return [...soloCollectionIds, collectionId];
}

export function toggleMutedCollectionIds(
  hiddenCollectionIds: string[],
  soloCollectionIds: SoloCollectionIds,
  collectionId: string
) {
  const isMuted = hiddenCollectionIds.includes(collectionId);

  if (isMuted) {
    return {
      hiddenCollectionIds: hiddenCollectionIds.filter((id) => id !== collectionId),
      soloCollectionIds,
    };
  }

  return {
    hiddenCollectionIds: [...hiddenCollectionIds, collectionId],
    soloCollectionIds: soloCollectionIds.filter((id) => id !== collectionId),
  };
}

export function shouldAutoOpenLayerDrawer(
  isMobileViewport: boolean,
  mode: InteractionMode,
  hasPendingPin: boolean,
  traceDraftFinalized: boolean
) {
  if (!isMobileViewport) {
    return false;
  }

  return hasPendingPin || (mode === "trace" && traceDraftFinalized);
}
