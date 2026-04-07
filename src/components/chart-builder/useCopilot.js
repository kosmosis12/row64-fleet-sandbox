import { useCallback, useRef, useState } from "react";
import { buildSystemPrompt } from "./copilotSystemPrompt";

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "gemma4:26b";
const MAX_HISTORY = 20;

// Extract the first ```json ... ``` block from a message and parse it.
// Returns a chart config object or null if not found / invalid.
export function extractChartConfig(text) {
  if (!text) return null;
  const match = text.match(/```json\s*([\s\S]*?)```/i);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[1].trim());
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.chartType || !parsed.x || !parsed.y) return null;
    return {
      chartType: parsed.chartType,
      x: parsed.x,
      y: parsed.y,
      groupBy: parsed.groupBy ?? null,
      agg: parsed.agg ?? "sum",
      filters: Array.isArray(parsed.filters) ? parsed.filters.map((f) => ({
        column: f.column,
        min: f.min ?? "",
        max: f.max ?? "",
        values: Array.isArray(f.values) ? f.values : [],
      })) : [],
    };
  } catch {
    return null;
  }
}

export function useCopilot() {
  const [messages, setMessages] = useState([]); // { role: "user"|"assistant", content: string }
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const clear = useCallback(() => {
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setError(null);
    setStreaming(false);
  }, []);

  const send = useCallback(async (userText) => {
    const text = userText.trim();
    if (!text || streaming) return;
    setError(null);

    const history = [...messages, { role: "user", content: text }].slice(-MAX_HISTORY);
    // Append an empty assistant placeholder we stream into.
    setMessages([...history, { role: "assistant", content: "" }]);
    setStreaming(true);

    const payload = {
      model: MODEL,
      stream: true,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        ...history,
      ],
    };

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const resp = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ac.signal,
      });
      if (!resp.ok || !resp.body) {
        throw new Error(`Ollama HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";

      // Ollama streams NDJSON: one JSON object per line.
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let nl;
        while ((nl = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 1);
          if (!line) continue;
          try {
            const obj = JSON.parse(line);
            const chunk = obj?.message?.content ?? "";
            if (chunk) {
              acc += chunk;
              // Mutate the last assistant message with the running accumulation.
              setMessages((prev) => {
                const next = prev.slice();
                next[next.length - 1] = { role: "assistant", content: acc };
                return next;
              });
            }
            if (obj?.done) {
              // server signaled completion
            }
          } catch {
            // ignore malformed line
          }
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message || String(e));
        setMessages((prev) => {
          const next = prev.slice();
          const last = next[next.length - 1];
          if (last && last.role === "assistant" && !last.content) {
            next[next.length - 1] = { role: "assistant", content: `[error] ${e.message || e}` };
          }
          return next;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [messages, streaming]);

  return { messages, streaming, error, send, clear };
}
