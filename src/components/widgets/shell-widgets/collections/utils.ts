import type { Collection, InteractionMode } from "@/app/page";

export const getSelectionActionLabel = (mode: InteractionMode) => {
  if (mode === "trace" || mode === "editTrace") {
    return "Path";
  }

  if (mode === "area" || mode === "editArea") {
    return "Zone";
  }

  return "Pin";
};

export const isCollectionDirty = (draft: Collection | null, baseline: Collection | null) => {
  if (!draft || !baseline) {
    return false;
  }

  return (
    draft.name !== baseline.name ||
    draft.color !== baseline.color ||
    draft.icon !== baseline.icon
  );
};

export const moveCollectionToFront = (collections: Collection[], collectionId: string) => {
  const selectedIndex = collections.findIndex((collection) => collection.id === collectionId);

  if (selectedIndex <= 0) {
    return collections;
  }

  const nextCollections = [...collections];
  const [selectedCollection] = nextCollections.splice(selectedIndex, 1);
  nextCollections.unshift(selectedCollection);
  return nextCollections;
};
