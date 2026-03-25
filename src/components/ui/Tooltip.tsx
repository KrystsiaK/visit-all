"use client";

import { cloneElement, isValidElement, useLayoutEffect, useRef, useState, type ReactElement, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  label: string;
  children: ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!visible) {
      return;
    }

    const updatePosition = () => {
      const trigger = triggerRef.current;
      const tooltip = tooltipRef.current;

      if (!trigger || !tooltip) {
        return;
      }

      const triggerRect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const idealTop = triggerRect.top - tooltipRect.height - 10;
      const minViewportPadding = 12;
      const top = Math.max(minViewportPadding, idealTop);
      const left = Math.min(
        window.innerWidth - tooltipRect.width / 2 - minViewportPadding,
        Math.max(minViewportPadding + tooltipRect.width / 2, triggerRect.left + triggerRect.width / 2)
      );

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [visible]);

  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<{ onMouseEnter?: () => void; onMouseLeave?: () => void; onFocus?: () => void; onBlur?: () => void }>, {
        onMouseEnter: () => setVisible(true),
        onMouseLeave: () => setVisible(false),
        onFocus: () => setVisible(true),
        onBlur: () => setVisible(false),
      })
    : children;

  return (
    <>
      <span ref={triggerRef} className="inline-flex">
        {child}
      </span>

      {visible && typeof document !== "undefined"
        ? createPortal(
            <span
              ref={tooltipRef}
              className="pointer-events-none fixed z-[160]"
              style={{
                top: position.top,
                left: position.left,
                transform: "translateX(-50%)",
              }}
            >
              <span className="flex flex-col items-center">
                <span className="flex items-stretch overflow-hidden rounded-xl border border-black/10 bg-[#f8f6f1] shadow-[0px_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                  <span className="flex h-full w-1.5 flex-col">
                    <span className="flex-1 bg-[#ff0000]" />
                    <span className="flex-1 bg-[#ffff00]" />
                    <span className="flex-1 bg-[#0000ff]" />
                  </span>
                  <span className="whitespace-nowrap px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-800">
                    {label}
                  </span>
                </span>
                <span className="mt-[-1px] flex h-2 w-4 overflow-hidden rounded-b-sm">
                  <span className="flex-1 bg-[#ff0000]" />
                  <span className="flex-1 bg-[#ffff00]" />
                  <span className="flex-1 bg-[#0000ff]" />
                </span>
              </span>
            </span>,
            document.body
          )
        : null}
    </>
  );
}
