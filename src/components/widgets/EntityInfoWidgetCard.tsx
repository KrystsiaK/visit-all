import { MapPin, PencilLine } from "lucide-react";
import { InlineEditableText } from "@/components/inputs/InlineEditableText";
import type { WidgetEntityPayload, WidgetInstanceRecord } from "@/lib/widgets";
import { ShellHeroCard } from "@/components/shells/ShellHeroCard";
import { BaseWidget } from "@synarava/shell-kit";

interface EntityInfoWidgetCardProps {
  widget: WidgetInstanceRecord;
  entity: WidgetEntityPayload;
  entityTitle: string;
  editable: boolean;
  presentation?: "default" | "pinned";
  canRemove?: boolean;
  removing?: boolean;
  onTitleChange: (value: string) => void;
  onTitleCommit: () => Promise<void>;
  onBackgroundStyleChange?: (widgetId: string, backgroundStyle: string) => void;
  onRemove?: () => void;
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
  entityTitle,
  editable,
  presentation = "default",
  canRemove = false,
  removing = false,
  onTitleChange,
  onTitleCommit,
  onBackgroundStyleChange,
  onRemove,
}: EntityInfoWidgetCardProps) {
  const subtitleLabel =
    entity.type === "trace"
      ? "Path Layer"
      : entity.type === "area"
        ? "Zone Layer"
        : "Location";

  if (presentation === "pinned") {
    return (
      <ShellHeroCard
        dataTestId="entity-pinned-hero"
        eyebrow={subtitleLabel}
        title={entityTitle || entity.title}
        titleContent={
          <InlineEditableText
            value={entityTitle}
            placeholder={entity.title}
            disabled={false}
            editable={editable}
            onChange={onTitleChange}
            onCommit={onTitleCommit}
            readOnlyClassName="truncate text-[16px] font-black tracking-tight text-neutral-950"
            inputClassName="w-full border-none bg-transparent p-0 text-[16px] font-black tracking-tight text-neutral-950 outline-none placeholder:text-neutral-300"
          />
        }
        subtitle={entity.subtitle || `${entity.type} entity`}
        accent={
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-[18px] ${getAccentClasses(entity.type)}`}
          >
            <MapPin className="h-5 w-5" />
          </div>
        }
      />
    );
  }

  return (
    <BaseWidget
      title={entityTitle || entity.title}
      subtitle={entity.subtitle || `${entity.type} entity`}
      backgroundStyle={
        typeof widget.config.chromeBackgroundStyle === "string"
          ? widget.config.chromeBackgroundStyle
          : "default"
      }
      onBackgroundStyleChange={
        onBackgroundStyleChange
          ? (backgroundStyle) => onBackgroundStyleChange(widget.id, backgroundStyle)
          : undefined
      }
      settingsContent={
        canRemove && onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            disabled={removing}
            className="flex min-h-11 w-full items-center justify-center rounded-2xl border border-[#c61f1f]/15 bg-[#fff6f6] px-4 text-sm font-medium text-[#a11a1a] transition-colors hover:bg-[#ffefef] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {removing ? "Removing..." : "Remove Widget"}
          </button>
        ) : null
      }
      accent={
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${getAccentClasses(entity.type)}`}>
          <MapPin className="h-4 w-4" />
        </div>
      }
    >
      <div className="rounded-[24px] bg-white/55 p-5">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] ${getAccentClasses(entity.type)}`}>
            <PencilLine className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">
              Inline title
            </p>
            <InlineEditableText
              value={entityTitle}
              placeholder={entity.title}
              disabled={false}
              editable={editable}
              onChange={onTitleChange}
              onCommit={onTitleCommit}
              className="mt-2"
              readOnlyClassName="text-[28px] font-black tracking-tight text-neutral-950"
              inputClassName="w-full border-none bg-transparent p-0 text-[28px] font-black tracking-tight text-neutral-950 outline-none placeholder:text-neutral-300"
            />
            <p className="mt-2 text-sm leading-5 text-neutral-500">
              Name lives in the independent entity enrichment layer and this widget only reads or triggers its persistence.
            </p>
          </div>
        </div>
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
    </BaseWidget>
  );
}
