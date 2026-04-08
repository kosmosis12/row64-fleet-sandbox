import { useState, useRef, useEffect } from "react";
import {
  buildCopilotSystemPrompt,
  extractChartConfig,
  OLLAMA_ENDPOINT,
  OLLAMA_MODEL,
} from "./copilotSystemPrompt";

// Slide-out AI copilot drawer used by both Fleet and Water chart builders.
// Talks to a local Ollama server; when the model returns a JSON chart config,
// we merge it into the chart builder state via onApplyConfig.
export default function CopilotDrawer({
  open,
  onClose,
  mode = "fleet",
  columnDefs = [],
  currentConfig,
  onApplyConfig,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, pending]);

  const presets = mode === "water"
    ? [
        "Average pressure PSI by service area",
        "Leaks by pipe material",
        "Estimated daily loss by crew",
      ]
    : [
        "Average fuel by status",
        "Miles to service by route",
        "Speed vs fuel scatter",
      ];

  const sendPrompt = async (text) => {
    if (!text || pending) return;
    const userMsg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setPending(true);
    setError(null);
    try {
      const system = buildCopilotSystemPrompt({ mode, columnDefs });
      const resp = await fetch(OLLAMA_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          stream: false,
          messages: [
            { role: "system", content: system },
            {
              role: "system",
              content: `Current chart config: ${JSON.stringify(currentConfig)}`,
            },
            ...next.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      if (!resp.ok) throw new Error(`Ollama ${resp.status}`);
      const data = await resp.json();
      const content = data?.message?.content || data?.choices?.[0]?.message?.content || "";
      const cfg = extractChartConfig(content);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content, applied: !!cfg, config: cfg },
      ]);
      if (cfg && onApplyConfig) {
        onApplyConfig({
          chartType: cfg.chartType || currentConfig.chartType,
          x: cfg.x || currentConfig.x,
          y: cfg.y || currentConfig.y,
          groupBy: cfg.groupBy ?? null,
          agg: cfg.agg || currentConfig.agg,
          filters: Array.isArray(cfg.filters) ? cfg.filters : [],
        });
      }
    } catch (e) {
      setError(
        `Could not reach Ollama at ${OLLAMA_ENDPOINT}. Start Ollama with "${OLLAMA_MODEL}" to use the copilot.`
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "(copilot offline)", applied: false },
      ]);
    } finally {
      setPending(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: 340,
        background: "#ffffff",
        borderLeft: "1px solid #e0e0e8",
        boxShadow: "-4px 0 16px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        fontFamily: "'Segoe UI',-apple-system,sans-serif",
      }}
    >
      <div
        style={{
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          borderBottom: "1px solid #e0e0e8",
          background: "#f5f6f8",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10b981",
            }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.05em" }}>
            {mode === "water" ? "WATER OPS COPILOT" : "FLEET COPILOT"}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#888",
            cursor: "pointer",
            fontSize: 16,
            padding: "0 6px",
          }}
        >
          ×
        </button>
      </div>

      <div
        ref={logRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          background: "#fafbfc",
        }}
      >
        {messages.length === 0 && (
          <div>
            <div style={{ fontSize: 11, color: "#666", marginBottom: 8 }}>
              Ask the copilot to build a chart. Powered by local {OLLAMA_MODEL}.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => sendPrompt(p)}
                  style={{
                    textAlign: "left",
                    background: "#ffffff",
                    border: "1px solid #e0e0e8",
                    borderRadius: 4,
                    padding: "6px 10px",
                    fontSize: 11,
                    color: "#0078D4",
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "90%",
              background: m.role === "user" ? "#0078D4" : "#ffffff",
              color: m.role === "user" ? "#fff" : "#1a1a2e",
              border: m.role === "user" ? "none" : "1px solid #e0e0e8",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: 11,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {m.content}
            {m.applied && (
              <div
                style={{
                  marginTop: 4,
                  fontSize: 9,
                  color: "#10b981",
                  fontWeight: 700,
                }}
              >
                ✓ Chart config applied
              </div>
            )}
          </div>
        ))}
        {pending && (
          <div style={{ fontSize: 11, color: "#888", fontStyle: "italic" }}>
            thinking...
          </div>
        )}
        {error && (
          <div
            style={{
              fontSize: 10,
              color: "#b91c1c",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              padding: 6,
              borderRadius: 4,
            }}
          >
            {error}
          </div>
        )}
      </div>

      <div
        style={{
          padding: 10,
          borderTop: "1px solid #e0e0e8",
          background: "#fff",
          display: "flex",
          gap: 6,
          flexShrink: 0,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendPrompt(input);
          }}
          placeholder="Describe the chart you want..."
          style={{
            flex: 1,
            padding: "6px 10px",
            border: "1px solid #d0d0dc",
            borderRadius: 4,
            fontSize: 11,
            background: "#fff",
            color: "#1a1a2e",
            outline: "none",
          }}
        />
        <button
          onClick={() => sendPrompt(input)}
          disabled={pending}
          style={{
            background: pending ? "#9ca3af" : "#0078D4",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "0 12px",
            fontSize: 11,
            fontWeight: 700,
            cursor: pending ? "default" : "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
