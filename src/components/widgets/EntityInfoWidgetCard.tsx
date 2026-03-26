import type { ChangeEvent } from "react";
import { Calendar, Image as ImageIcon, MapPin } from "lucide-react";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";
import { Tooltip } from "@/components/ui/Tooltip";
import { WidgetChrome } from "@/components/widgets/WidgetChrome";

interface EntityInfoWidgetCardProps {
  widget: WidgetInstanceRecord;
  entity: WidgetEntityPayload;
  pinNote: string;
  pinImage: string | null;
  imageFile: File | null;
  saving: boolean;
  editable: boolean;
  interactionsDisabled?: boolean;
  onNoteChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onImageUpload: (file: File) => Promise<void>;
  onImageDelete: () => Promise<void>;
}

function getAccentClasses(type: WidgetEntityPayload["type"]) {
  if (type === "trace") {
    return "bg-[#1122ff] text-white";
  }

  if (type === "area") {
    return "bg-[#ffe94d] text-black";
  }

  return "bg-[#ff1b0a] text-white";
}

export function EntityInfoWidgetCard({
  widget,
  entity,
  pinNote,
  pinImage,
  imageFile,
  saving,
  editable,
  interactionsDisabled = false,
  onNoteChange,
  onImageUpload,
  onImageDelete,
}: EntityInfoWidgetCardProps) {
  const subtitleLabel =
    entity.type === "trace"
      ? "Path Layer"
      : entity.type === "area"
        ? "Zone Layer"
        : "Location";

  return (
    <WidgetChrome
      title={entity.title}
      subtitle={entity.subtitle || `${entity.type} entity`}
      accent={
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${getAccentClasses(entity.type)}`}>
          <MapPin className="h-4 w-4" />
        </div>
      }
    >

      {editable && interactionsDisabled && (
        <div className="mb-4 rounded-xl border border-dashed border-black/10 bg-white/35 px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
            Deferred
          </p>
          <p className="mt-2 text-sm leading-5 text-neutral-600">
            Widget editing is temporarily disabled for this iteration.
          </p>
        </div>
      )}

      {(pinImage || imageFile) ? (
        <div className="mb-4 relative overflow-hidden rounded-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pinImage || URL.createObjectURL(imageFile!)}
            alt={entity.title}
            className="h-32 w-full object-cover"
          />
          {editable && !interactionsDisabled && (
            <Tooltip label="Remove Photo">
              <button
                onClick={onImageDelete}
                disabled={saving}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/85 text-xs font-black text-black transition-colors hover:bg-black hover:text-white"
              >
                X
              </button>
            </Tooltip>
          )}
        </div>
      ) : editable ? (
        <label className="mb-4 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl bg-white/35 text-neutral-500 transition-colors hover:bg-white/55">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Add Photo</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (!interactionsDisabled && e.target.files?.[0]) {
                void onImageUpload(e.target.files[0]);
              }
            }}
            disabled={saving || interactionsDisabled}
          />
        </label>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white/40 px-3 py-3">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#1122ff] text-white">
            <MapPin className="h-4 w-4" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#737373]">
            {subtitleLabel}
          </p>
          <p className="mt-1 text-sm font-medium text-[#171717]">
            {entity.subtitle || "Unassigned"}
          </p>
        </div>

        <div className="rounded-xl bg-white/40 px-3 py-3">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#ffe94d] text-black">
            <Calendar className="h-4 w-4" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#737373]">
            Geometry
          </p>
          <p className="mt-1 text-sm font-medium capitalize text-[#171717]">
            {entity.geometryKind}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-white/40 px-4 py-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#737373]">
          {editable ? "Curator Note" : widget.name}
        </p>
        {editable ? (
          <textarea
            value={pinNote}
            onChange={onNoteChange}
            rows={5}
            placeholder="Enter contextual data..."
            className="mt-3 h-32 w-full resize-none border-none bg-transparent p-0 text-sm leading-relaxed text-[#171717] placeholder:text-neutral-400 focus:outline-none"
            disabled={interactionsDisabled}
          />
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-[#525252]">
            {entity.description || "This entity is connected through the shared widget API."}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-white/40 px-3 py-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium text-[#525252]">
            {widget.name}
          </span>
          <span className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium uppercase text-[#525252]">
            {entity.type}
          </span>
        </div>
      </div>
    </WidgetChrome>
  );
}
