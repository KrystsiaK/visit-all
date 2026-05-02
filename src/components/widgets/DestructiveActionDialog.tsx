"use client";

interface DestructiveActionDialogProps {
  open: boolean;
  saving: boolean;
  eyebrow: string;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DestructiveActionDialog({
  open,
  saving,
  eyebrow,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: DestructiveActionDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/18 p-6 backdrop-blur-sm">
      <div className="w-full max-w-[420px] overflow-hidden rounded-[28px] border border-black/15 bg-[#f8f6f1] shadow-[0px_20px_60px_rgba(0,0,0,0.18)]">
        <div className="flex h-3">
          <div className="flex-1 bg-[#ff0000]" />
          <div className="flex-1 bg-[#ffff00]" />
          <div className="flex-1 bg-[#0000ff]" />
        </div>
        <div className="p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-neutral-500">
            {eyebrow}
          </p>
          <h3 className="mt-3 text-[28px] font-black uppercase leading-[0.95] tracking-tight text-neutral-950">
            {title}
          </h3>
          <p className="mt-4 text-sm leading-6 text-neutral-700">{description}</p>
        </div>
        <div className="grid grid-cols-2 border-t border-black/10">
          <button
            type="button"
            onClick={onCancel}
            className="h-16 bg-[#f8f6f1] text-sm font-black uppercase tracking-[0.18em] text-neutral-700 transition-colors hover:bg-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="h-16 border-l border-black/10 bg-[#111111] text-sm font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#ff0000] disabled:cursor-not-allowed disabled:opacity-65"
          >
            {saving ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
