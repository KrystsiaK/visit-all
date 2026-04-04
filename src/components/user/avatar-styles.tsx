import { UserRound } from "lucide-react";

import { cn } from "@/components/ui/utils";

export const avatarStyleOptions = [
  {
    id: "mondrian-primary",
    name: "Primary",
    panelClassName: "bg-white border-black/10",
    iconWrapClassName: "bg-[#00327d] text-white",
  },
  {
    id: "mondrian-sun",
    name: "Sun",
    panelClassName: "bg-[#ffdf00] border-[#111111]/10",
    iconWrapClassName: "bg-[#111111] text-white",
  },
  {
    id: "mondrian-studio",
    name: "Studio",
    panelClassName: "bg-[#b7102a] border-[#111111]/10 text-white",
    iconWrapClassName: "bg-white text-[#111111]",
  },
  {
    id: "mondrian-night",
    name: "Night",
    panelClassName: "bg-[#111111] border-black/10 text-white",
    iconWrapClassName: "bg-[#ffdf00] text-[#111111]",
  },
] as const;

export type AvatarStyleId = (typeof avatarStyleOptions)[number]["id"];

export function isAvatarStyleId(value: string): value is AvatarStyleId {
  return avatarStyleOptions.some((option) => option.id === value);
}

export function getAvatarStyle(styleId?: string | null) {
  return avatarStyleOptions.find((option) => option.id === styleId) ?? avatarStyleOptions[0];
}

export function UserAvatarBadge({
  styleId,
  size = "md",
}: {
  styleId?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const style = getAvatarStyle(styleId);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border shadow-[0px_6px_18px_rgba(0,0,0,0.08)]",
        style.panelClassName,
        size === "sm" && "h-9 w-9",
        size === "md" && "h-11 w-11",
        size === "lg" && "h-14 w-14"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full",
          style.iconWrapClassName,
          size === "sm" && "h-6 w-6",
          size === "md" && "h-7 w-7",
          size === "lg" && "h-9 w-9"
        )}
      >
        <UserRound
          className={cn(
            size === "sm" && "h-3.5 w-3.5",
            size === "md" && "h-4 w-4",
            size === "lg" && "h-5 w-5"
          )}
        />
      </div>
    </div>
  );
}
