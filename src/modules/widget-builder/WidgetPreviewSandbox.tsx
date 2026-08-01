"use client";

import { useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";

import { ExecutedWidget } from "@synarava/widget-generator/executor";
import type { GenerationResult } from "@synarava/widget-generator";
import { WIDGET_SANDBOX_MODULES } from "@/modules/widget-runtime/sandbox-modules";

interface WidgetPreviewSandboxProps {
  result: GenerationResult | null;
  generating: boolean;
  accepting: boolean;
  onAccept: (result: GenerationResult) => Promise<void>;
  onRefine: () => void;
}

export function WidgetPreviewSandbox({
  result,
  generating,
  accepting,
  onAccept,
  onRefine,
}: WidgetPreviewSandboxProps) {
  const [showCode, setShowCode] = useState(false);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  if (generating) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-neutral-400">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 animate-bounce rounded-full bg-[#1122ff]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-sm">Generating widget...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-black/8 bg-white/60">
          <span className="text-2xl">✦</span>
        </div>
        <p className="text-sm text-neutral-500">
          Your widget preview will appear here once the AI generates it.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-5">
      {/* Widget meta */}
      <div className="rounded-2xl border border-black/8 bg-white/80 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400">
          Generated Widget
        </p>
        <h3 className="mt-1 text-lg font-black tracking-tight text-neutral-950">
          {result.meta.name}
        </h3>
        <p className="mt-1 text-sm text-neutral-500">{result.meta.description}</p>

        {result.meta.ports.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              Ports
            </p>
            {result.meta.ports.map((port) => (
              <div
                key={port.portKey}
                className="flex items-center gap-2 text-xs text-neutral-600"
              >
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    port.direction === "output"
                      ? "bg-[#e8f0ff] text-[#1122ff]"
                      : "bg-[#f0f0f0] text-neutral-600"
                  }`}
                >
                  {port.direction}
                </span>
                <code className="font-mono">{port.portKey}</code>
                <span className="text-neutral-400">→ {port.valueType}</span>
                <span>{port.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Live preview */}
      <div className="rounded-2xl border border-black/8 bg-gradient-to-br from-[#dcecf4]/40 via-[#eef4f8]/40 to-[#f7f7f3]/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
            Live Preview
          </p>
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-950"
          >
            {showCode ? "Hide Code" : "View Code"}
          </button>
        </div>

        <div className="rounded-xl bg-white/40 p-3">
          <ExecutedWidget
            code={result.componentCode}
            modules={WIDGET_SANDBOX_MODULES}
            onError={setRuntimeError}
          />
        </div>

        {showCode && (
          <div className="mt-3 rounded-xl bg-[#0a0a0a] p-4">
            <pre className="overflow-x-auto whitespace-pre-wrap text-[11px] leading-5 text-[#dcecf4]">
              {result.componentCode}
            </pre>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pb-2">
        <button
          type="button"
          onClick={onRefine}
          className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:bg-white"
        >
          <RefreshCw className="h-4 w-4" />
          Refine
        </button>
        <button
          type="button"
          onClick={() => void onAccept(result)}
          disabled={!!runtimeError || accepting}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#111111] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1122ff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />
          {runtimeError ? "Fix Errors First" : accepting ? "Saving..." : "Accept Widget"}
        </button>
      </div>
    </div>
  );
}
