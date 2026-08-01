"use client";

import { useState, useCallback } from "react";
import type { ChatMessage, GenerationResult } from "@synarava/widget-generator";

interface WidgetBuilderSession {
  messages: ChatMessage[];
  result: GenerationResult | null;
  generating: boolean;
  error: string | null;
  send: (userMessage: string) => Promise<void>;
  accepting: boolean;
  accept: (result: GenerationResult) => Promise<void>;
  reset: () => void;
}

function parseResult(raw: string): GenerationResult | null {
  try {
    const metaMatch = raw.match(/<widget_definition>([\s\S]*?)<\/widget_definition>/);
    const codeMatch = raw.match(/<component_code>([\s\S]*?)<\/component_code>/);
    const explanationMatch = raw.match(/<explanation>([\s\S]*?)<\/explanation>/);

    if (!metaMatch || !codeMatch || !explanationMatch) return null;

    return {
      meta: JSON.parse(metaMatch[1].trim()) as GenerationResult["meta"],
      componentCode: codeMatch[1].trim(),
      explanation: explanationMatch[1].trim(),
    };
  } catch {
    return null;
  }
}

export function useWidgetBuilderSession(
  onAccept: (result: GenerationResult) => Promise<void>
): WidgetBuilderSession {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (userMessage: string) => {
    setGenerating(true);
    setError(null);

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(nextMessages);

    let accumulated = "";
    const assistantPlaceholder: ChatMessage = { role: "assistant", content: "" };
    setMessages([...nextMessages, assistantPlaceholder]);

    try {
      const response = await fetch("/api/widget-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") break;

          try {
            const parsed = JSON.parse(payload) as { delta?: string; error?: string };
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.delta) {
              accumulated += parsed.delta;
              setMessages([
                ...nextMessages,
                { role: "assistant", content: accumulated },
              ]);
            }
          } catch (parseErr) {
            if (parseErr instanceof Error && parseErr.message !== "Unexpected end of JSON input") {
              throw parseErr;
            }
          }
        }
      }

      const parsed = parseResult(accumulated);
      setResult(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setMessages(nextMessages);
    } finally {
      setGenerating(false);
    }
  }, [messages]);

  const accept = useCallback(async (r: GenerationResult) => {
    setAccepting(true);
    setError(null);
    try {
      await onAccept(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save widget");
      throw err;
    } finally {
      setAccepting(false);
    }
  }, [onAccept]);

  const reset = useCallback(() => {
    setMessages([]);
    setResult(null);
    setError(null);
    setGenerating(false);
    setAccepting(false);
  }, []);

  return { messages, result, generating, accepting, error, send, accept, reset };
}
