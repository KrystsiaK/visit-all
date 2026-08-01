"use client";

import { useRef, useEffect, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import type { ChatMessage } from "@synarava/widget-generator";
import { AutoResizeTextarea } from "@synarava/ui-kit";

interface WidgetBuilderChatProps {
  messages: ChatMessage[];
  generating: boolean;
  error: string | null;
  onSend: (message: string) => void;
}

const SUGGESTIONS = [
  "A widget that shows today's weather for a saved location",
  "A countdown timer to a custom date",
  "A quick note widget with a single text field",
  "A live word counter for the current pin's note",
];

export function WidgetBuilderChat({
  messages,
  generating,
  error,
  onSend,
}: WidgetBuilderChatProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const empty = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    const text = input.trim();
    if (!text || generating) return;
    setInput("");
    onSend(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Message list */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
        {empty ? (
          <div className="mt-6">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400">
              Widget Builder
            </p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-neutral-950">
              Describe a widget
            </h2>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Tell me what you want to build. I'll generate a working widget using the
              design system components.
            </p>
            <div className="mt-5 space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSend(s)}
                  className="w-full rounded-2xl border border-black/8 bg-white/70 px-4 py-3 text-left text-sm text-neutral-700 transition-colors hover:bg-white hover:text-neutral-950"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  msg.role === "user"
                    ? "bg-[#111111] text-white"
                    : "border border-black/8 bg-white/80 text-neutral-800"
                }`}
              >
                {msg.role === "assistant" ? (
                  <AssistantMessage content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}

        {error && (
          <div className="rounded-2xl border border-[#b7102a]/20 bg-[#fff4f4] px-4 py-3 text-sm text-[#b7102a]">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-black/8 p-4">
        <div className="flex items-end gap-3 rounded-[20px] border border-black/10 bg-white/90 p-2 pl-4 shadow-[0_10px_30px_rgba(17,17,17,0.06)] transition-[border-color,box-shadow,background-color] focus-within:border-[#1122ff]/35 focus-within:bg-white focus-within:shadow-[0_12px_36px_rgba(17,34,255,0.10)]">
          <AutoResizeTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            maxHeight={168}
            placeholder="Describe your widget..."
            aria-label="Describe your widget"
            disabled={generating}
            className="min-h-10 flex-1 bg-transparent py-2 text-[15px] leading-6 text-neutral-950 placeholder:text-neutral-400 focus:outline-none disabled:opacity-50"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!input.trim() || generating}
            aria-label="Send widget description"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#111111] text-white transition-[background-color,transform,opacity] hover:bg-[#1122ff] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AssistantMessage({ content }: { content: string }) {
  // Show explanation only — strip XML tags
  const explanation = content.match(/<explanation>([\s\S]*?)<\/explanation>/)?.[1]?.trim();
  const hasCode = content.includes("<component_code>");

  if (!content) return <span className="text-neutral-400">Generating...</span>;

  return (
    <div className="space-y-2">
      <p className="whitespace-pre-wrap">{explanation ?? content.replace(/<[\s\S]*?>/g, "").trim()}</p>
      {hasCode && (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f4e8] px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#15803d]">
          ✓ Widget ready
        </span>
      )}
    </div>
  );
}
