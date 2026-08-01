// src/modules/messenger/components/SlackBlockKitRenderer.tsx
"use client";

import { useState } from "react";
import { CheckSquare, Square, ChevronDown } from "lucide-react";

interface SlackBlockKitRendererProps {
  content: string;
  onAction: (actionId: string, value: string) => void;
  accentColor: string;
}

// Simple helper to parse Slack Mrkdwn
function parseSlackMrkdwn(text: string) {
  if (!text) return "";
  
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold *text*
  html = html.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
  
  // Italics _text_
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");
  
  // Strikethrough ~text~
  html = html.replace(/~(.*?)~/g, "<del>$1</del>");
  
  // Inline code `code`
  html = html.replace(/`(.*?)`/g, "<code class='bg-black/10 px-1 py-0.5 rounded text-xs font-mono font-bold'>$1</code>");

  // Links &lt;url|label&gt;
  html = html.replace(/&lt;([^|&]+)\|([^&]+)&gt;/g, "<a href='$1' target='_blank' rel='noopener noreferrer' class='underline font-bold text-sky-400 hover:text-sky-300'>$2</a>");
  // Links without label &lt;url&gt;
  html = html.replace(/&lt;([^&]+)&gt;/g, "<a href='$1' target='_blank' rel='noopener noreferrer' class='underline font-bold text-sky-400 hover:text-sky-300'>$1</a>");

  // Newlines
  html = html.replace(/\n/g, "<br />");

  return html;
}

export function SlackBlockKitRenderer({ content, onAction, accentColor }: SlackBlockKitRendererProps) {
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});
  
  let payload: any = null;
  try {
    payload = JSON.parse(content);
  } catch (e) {
    // Return fallback text if not valid JSON
    return <p className="text-sm font-medium leading-5 whitespace-pre-wrap">{content}</p>;
  }

  const blocks = payload?.blocks;
  if (!Array.isArray(blocks)) {
    return <p className="text-sm font-medium leading-5 whitespace-pre-wrap">{content}</p>;
  }

  const handleSelectChange = (actionId: string, val: string) => {
    setSelectedValues(prev => ({ ...prev, [actionId]: val }));
    onAction(actionId, val);
  };

  return (
    <div className="flex flex-col gap-3 py-1 px-0.5 text-neutral-800 dark:text-neutral-100 max-w-full">
      {blocks.map((block: any, idx: number) => {
        const key = block.block_id || `block-${idx}`;

        switch (block.type) {
          case "header":
            return (
              <div key={key} className="font-extrabold text-base text-neutral-900 border-b border-black/5 pb-1">
                {block.text?.text || ""}
              </div>
            );

          case "divider":
            return <div key={key} className="h-px bg-black/8 my-0.5" />;

          case "section":
            return (
              <div key={key} className="flex gap-4 items-start justify-between">
                <div className="flex-1 min-w-0 text-sm leading-5">
                  {block.text?.type === "mrkdwn" ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: parseSlackMrkdwn(block.text?.text) }} 
                      className="break-words"
                    />
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{block.text?.text || ""}</p>
                  )}
                  {/* Fields list if any */}
                  {Array.isArray(block.fields) && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                      {block.fields.map((field: any, fIdx: number) => (
                        <div 
                          key={fIdx} 
                          dangerouslySetInnerHTML={{ __html: parseSlackMrkdwn(field.text || "") }}
                          className="break-words"
                        />
                      ))}
                    </div>
                  )}
                </div>
                {/* Accessory */}
                {block.accessory && (
                  <div className="shrink-0 max-w-[120px]">
                    {block.accessory.type === "image" && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        src={block.accessory.image_url} 
                        alt={block.accessory.alt_text || "accessory"} 
                        className="rounded-lg object-cover w-16 h-16 border border-black/5" 
                      />
                    )}
                    {block.accessory.type === "button" && (
                      <button
                        type="button"
                        onClick={() => onAction(block.accessory.action_id, block.accessory.value || "click")}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-black/10 hover:bg-black/5 active:scale-95 transition-all text-neutral-850"
                      >
                        {block.accessory.text?.text || "Click"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );

          case "context":
            return (
              <div key={key} className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-400 leading-none">
                {Array.isArray(block.elements) && block.elements.map((el: any, elIdx: number) => {
                  if (el.type === "image") {
                    return (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img 
                        key={elIdx}
                        src={el.image_url} 
                        alt={el.alt_text || "context"} 
                        className="w-4 h-4 rounded-full object-cover border border-black/5"
                      />
                    );
                  }
                  return (
                    <span 
                      key={elIdx} 
                      dangerouslySetInnerHTML={{ __html: parseSlackMrkdwn(el.text || "") }}
                    />
                  );
                })}
              </div>
            );

          case "actions":
            return (
              <div key={key} className="flex flex-wrap gap-2 items-center mt-1">
                {Array.isArray(block.elements) && block.elements.map((el: any, elIdx: number) => {
                  const elKey = el.action_id || `el-${elIdx}`;

                  if (el.type === "button") {
                    const isPrimary = el.style === "primary";
                    const isDanger = el.style === "danger";
                    return (
                      <button
                        key={elKey}
                        type="button"
                        onClick={() => onAction(el.action_id, el.value || "click")}
                        className={`text-xs font-black px-3.5 py-1.5 rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition-all border ${
                          isPrimary 
                            ? "text-white border-transparent"
                            : isDanger
                            ? "bg-red-500 hover:bg-red-650 text-white border-transparent"
                            : "bg-white/80 dark:bg-black/20 hover:bg-black/5 text-neutral-800 border-black/8"
                        }`}
                        style={isPrimary ? { backgroundColor: accentColor } : undefined}
                      >
                        {el.text?.text || "Button"}
                      </button>
                    );
                  }

                  if (el.type === "static_select" || el.type === "select") {
                    const currentVal = selectedValues[el.action_id] || "";
                    return (
                      <div key={elKey} className="relative inline-flex items-center shrink-0">
                        <select
                          value={currentVal}
                          onChange={(e) => handleSelectChange(el.action_id, e.target.value)}
                          className="appearance-none text-xs font-bold pl-3 pr-8 py-1.5 rounded-xl border border-black/10 bg-white/85 dark:bg-black/20 text-neutral-800 outline-none focus:border-black/20 transition-all cursor-pointer"
                        >
                          <option value="" disabled>{el.placeholder?.text || "Choose..."}</option>
                          {Array.isArray(el.options) && el.options.map((opt: any, optIdx: number) => (
                            <option key={optIdx} value={opt.value}>
                              {opt.text?.text || opt.value}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 pointer-events-none" />
                      </div>
                    );
                  }

                  if (el.type === "checkboxes") {
                    return (
                      <div key={elKey} className="flex flex-col gap-1.5 w-full">
                        {Array.isArray(el.options) && el.options.map((opt: any, optIdx: number) => {
                          const isChecked = selectedValues[`${el.action_id}-${opt.value}`] === "checked";
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                const nextState = isChecked ? "unchecked" : "checked";
                                setSelectedValues(prev => ({ ...prev, [`${el.action_id}-${opt.value}`]: nextState }));
                                onAction(el.action_id, `${opt.value}:${nextState}`);
                              }}
                              className="flex items-start gap-2.5 text-left text-xs hover:bg-black/4 p-1.5 rounded-lg transition-colors w-full"
                            >
                              <div className="shrink-0 mt-0.5" style={{ color: isChecked ? accentColor : "#737373" }}>
                                {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0 leading-tight">
                                <span className="font-bold block text-neutral-900">{opt.text?.text || ""}</span>
                                {opt.description && (
                                  <span className="text-[10px] text-neutral-450 block mt-0.5">{opt.description.text}</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
