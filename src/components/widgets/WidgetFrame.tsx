import type { ReactNode } from "react";
import { WidgetChrome } from "@/components/widgets/WidgetChrome";
import type { WidgetHost, WidgetHostOption } from "@/lib/widget-hosts";

interface WidgetFrameProps {
  title?: string;
  eyebrow?: string;
  accent?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  contentPaddingClassName?: string;
  currentHost?: WidgetHost;
  hostOptions?: WidgetHostOption[];
  hostSelectionDisabled?: boolean;
  onHostChange?: (host: WidgetHost) => void;
  settingsContent?: ReactNode;
  identityVisibility?: "inline" | "settings-only";
}

export function WidgetFrame({
  title,
  eyebrow,
  accent,
  children,
  className,
  bodyClassName,
  contentPaddingClassName,
  currentHost,
  hostOptions,
  hostSelectionDisabled,
  onHostChange,
  settingsContent,
  identityVisibility,
}: WidgetFrameProps) {
  return (
    <WidgetChrome
      title={title}
      eyebrow={eyebrow}
      accent={accent}
      className={className}
      bodyClassName={bodyClassName}
      contentPaddingClassName={contentPaddingClassName}
      currentHost={currentHost}
      hostOptions={hostOptions}
      hostSelectionDisabled={hostSelectionDisabled}
      onHostChange={onHostChange}
      settingsContent={settingsContent}
      identityVisibility={identityVisibility}
    >
      {children}
    </WidgetChrome>
  );
}
