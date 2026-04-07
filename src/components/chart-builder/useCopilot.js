import { useState, useRef, useCallback } from "react";
import { COLUMN_DEFS } from "./useChartData";
import { buildCopilotSystemPrompt } from "./copilotSystemPrompt";

const MAX_MESSAGES = 20;
const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "gemma4:26b";

const REQUIRED_KEYS = ["chartType", "x", "y", "groupBy", "agg", "filters"];

export function extractChartConfig(text) {
  if (!text) return null;
  const match = text.match(/```json\s*([\s\S]*?)```/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1].trim());
    for (const k of REQUIRED_KEYS) {
      if (!(k in parsed)) return null;
    }
    if (!Array.isArray(parsed.filters)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useCopilot() {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef(null);

  const clearChat = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = null;
    setStreaming(false);
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed || streaming) return;

    const systemPrompt = buildCopilotSystemPrompt(COLUMN_DEFS);
    const userMsg = { role: "user", content: trimmed };

    // Build outgoing chat history (with system message prepended).
    let history;
    setMessages((prev) => {
      const next = [...prev, userMsg, { role: "assistant", content: "" }];
      const trimmedNext = next.slice(-MAX_MESSAGES);
      history = [{ role: "system", content: systemPrompt }, ...trimmedNext.filter((m) => m.content !== "" || m.role === "user")];
      return trimmedNext;
    });

    setStreaming(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          stream: true,
          messages: history,
        }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) throw new Error(`Ollama HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const l = line.trim();
          if (!l) continue;
          try {
            const obj = JSON.parse(l);
            const chunk = obj?.message?.content || "";
            if (chunk) {
              setMessages((prev) => {
                const next = prev.slice();
                const last = next[next.length - 1];
                if (last && last.role === "assistant") {
                  next[next.length - 1] = { ...last, content: last.content + chunk };
                }
                return next;
              });
            }
          } catch {
            // ignore malformed line
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages((prev) => {
          const next = prev.slice();
          const last = next[next.length - 1];
          const errText = `\n\n_Error contacting Ollama at localhost:11434 — ${err.message}_`;
          if (last && last.role === "assistant") {
            next[next.length - 1] = { ...last, content: last.content + errText };
          }
          return next;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [streaming]);

  const cancel = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
  }, []);

  return { messages, streaming, sendMessage, clearChat, cancel };
}
