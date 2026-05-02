"use client";

import { DestructiveActionDialog } from "@/components/widgets/DestructiveActionDialog";

interface EntityDeleteDialogProps {
  open: boolean;
  saving: boolean;
  title: string;
  entityType: "pin" | "trace" | "area";
  onCancel: () => void;
  onConfirm: () => void;
}

export const EntityDeleteDialog = ({
  open,
  saving,
  title,
  entityType,
  onCancel,
  onConfirm,
}: EntityDeleteDialogProps) => {
  const entityLabel =
    entityType === "pin" ? "Pin" : entityType === "trace" ? "Path" : "Zone";

  return (
    <DestructiveActionDialog
      open={open}
      saving={saving}
      eyebrow={`Delete ${entityLabel}`}
      title={title}
      description={`This ${entityLabel.toLowerCase()}, its entity widgets, and uploaded local media tied to it will be removed from the active map state.`}
      confirmLabel={`Delete ${entityLabel}`}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
};
