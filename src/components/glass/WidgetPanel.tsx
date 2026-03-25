import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, ChevronRight, MapPin, Image as ImageIcon, Clock3 } from "lucide-react";
import { getGlobalWidgets } from "@/app/actions";
import type { WidgetInstanceRecord } from "@/lib/widgets";
import { Tooltip } from "@/components/ui/Tooltip";

const guggenheimImage = "https://www.figma.com/api/mcp/asset/b384ef56-9a38-4422-bd50-7f57815e7d02";
const architectureCollectionImage = "https://www.figma.com/api/mcp/asset/26e0c8e7-05ef-4a9d-b470-2a50304cd51d";

interface WidgetCardModel {
  id: string;
  type: "location" | "photo" | "time";
  title: string;
  subtitle: string;
  color: "red" | "blue" | "yellow";
  imageUrl?: string;
}

interface WidgetPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialWidgets: WidgetCardModel[] = [
  {
    id: "1",
    type: "location",
    title: "Guggenheim Museum",
    subtitle: "New York City, USA",
    color: "red",
    imageUrl: guggenheimImage,
  },
  {
    id: "2",
    type: "photo",
    title: "Architecture Collection",
    subtitle: "24 photos",
    color: "blue",
    imageUrl: architectureCollectionImage,
  },
  {
    id: "3",
    type: "time",
    title: "Last Updated",
    subtitle: "March 24, 2026",
    color: "yellow",
  },
];

function getWidgetIcon(type: WidgetCardModel["type"]) {
  if (type === "location") return MapPin;
  if (type === "photo") return ImageIcon;
  return Clock3;
}

function getWidgetColor(color: WidgetCardModel["color"]) {
  if (color === "red") return "bg-[#ff1b0a] text-white";
  if (color === "blue") return "bg-[#1122ff] text-white";
  return "bg-[#ffe94d] text-black";
}

function mapGlobalWidgetToCard(widget: WidgetInstanceRecord, index: number): WidgetCardModel {
  // TEMP(tech-debt): presentation fallback until global widget config/state becomes authorable.
  const baseCards: WidgetCardModel[] = [
    {
      id: widget.id,
      type: "location",
      title: "Map Overview",
      subtitle: "Shared widget library enabled",
      color: "red",
      imageUrl: guggenheimImage,
    },
    {
      id: widget.id,
      type: "photo",
      title: "Architecture Collection",
      subtitle: "24 photos",
      color: "blue",
      imageUrl: architectureCollectionImage,
    },
    {
      id: widget.id,
      type: "time",
      title: "Last Updated",
      subtitle: "March 25, 2026",
      color: "yellow",
    },
  ];

  return baseCards[index % baseCards.length];
}

export function WidgetPanel({ isOpen, onClose }: WidgetPanelProps) {
  const [widgets, setWidgets] = useState<WidgetCardModel[]>(initialWidgets);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const instances = await getGlobalWidgets();
        if (!cancelled) {
          if (instances.length === 0) {
            setWidgets(initialWidgets.slice(0, 1));
          } else {
            setWidgets(instances.map(mapGlobalWidgetToCard));
          }
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setWidgets(initialWidgets.slice(0, 1));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close widgets"
            onClick={onClose}
            className="fixed inset-0 z-[88] bg-black/12 backdrop-blur-[1px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="fixed inset-x-3 bottom-3 top-auto z-[90] h-[min(78vh,720px)] pointer-events-none md:inset-x-auto md:right-8 md:top-28 md:bottom-6 md:h-auto md:w-[376px]"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 36 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          >
          <div className="flex h-full flex-col gap-3 overflow-hidden py-3 pointer-events-auto md:gap-4 md:py-6 md:pl-6">
            <div className="flex justify-center md:hidden">
              <div className="h-1.5 w-14 rounded-full bg-black/12" />
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/70 p-6 shadow-[0px_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-3xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[24px] font-semibold leading-8 tracking-tight text-[#171717]">
                    Widget Center
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-[#737373]">
                    {loading ? "Loading widgets..." : `${widgets.length} active widgets`}
                  </p>
                </div>
                <Tooltip label="Close Widgets">
                  <button
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/60 text-neutral-600 transition-colors hover:bg-white"
                    aria-label="Close widgets"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </Tooltip>
              </div>

              <button
                disabled
                className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white/60 px-5 text-base font-medium text-[#171717] opacity-55 transition-colors disabled:cursor-not-allowed"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1122ff] text-white">
                  <Plus className="h-5 w-5" />
                </span>
                <span>Add Widget</span>
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500">Soon</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
              <div className="flex flex-col gap-3">
                {widgets.map((widget) => {
                  const Icon = getWidgetIcon(widget.type);

                  return (
                    <div
                      key={widget.id}
                      className="rounded-2xl border border-black/10 bg-white/50 p-[17px] shadow-[0px_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-3xl"
                    >
                      <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-xl ${getWidgetColor(widget.color)}`}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {widget.imageUrl && (
                        <div className="mb-4 overflow-hidden rounded-xl">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={widget.imageUrl}
                            alt={widget.title}
                            className="h-32 w-full object-cover"
                          />
                        </div>
                      )}

                      <div>
                        <h3 className="text-sm font-medium leading-5 text-[#171717]">
                          {widget.title}
                        </h3>
                        <p className="mt-0.5 text-xs leading-4 text-[#737373]">
                          {widget.subtitle}
                        </p>
                      </div>

                      <button
                        disabled
                        className="mt-4 flex h-8 w-full items-center justify-between rounded-xl bg-white/40 px-3 text-xs font-medium text-[#525252] opacity-60 transition-colors disabled:cursor-not-allowed"
                      >
                        <span>Deferred</span>
                        <ChevronRight className="h-3.5 w-3.5 text-[#a3a3a3]" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
