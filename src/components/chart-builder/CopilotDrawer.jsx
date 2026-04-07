import { useState, useRef, useEffect } from "react";
import { useCopilot, extractChartConfig } from "./useCopilot";

const EXAMPLES = [
  "Show average fuel by status",
  "Plot speed vs temperature as a scatter",
  "Which routes have the most trucks?",
];

function MessageBubble({ msg, onApply }) {
  const isUser = msg.role === "user";
  const cfg = !isUser ? extractChartConfig(msg.content) : null;
  const displayText = cfg
    ? msg.content.replace(/```json[\s\S]*?```/, "").trim()
    : msg.content;

  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 8,
    }}>
      <div style={{
        maxWidth: "85%",
        background: isUser ? "#0078D4" : "#f0f1f3",
        color: isUser ? "#ffffff" : "#1a1a2e",
        padding: "8px 11px",
        borderRadius: 10,
        fontSize: 12,
        lineHeight: 1.45,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        border: isUser ? "none" : "1px solid #e0e0e8",
      }}>
        {displayText || (isUser ? "" : "…")}
        {cfg && (
          <button
            onClick={() => onApply(cfg)}
            style={{
              display: "block",
              marginTop: 8,
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 5,
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            ✓ APPLY TO CHART
          </button>
        )}
      </div>
    </div>
  );
}

export default function CopilotDrawer({ open, config, setConfig }) {
  const { messages, streaming, sendMessage, clearChat } = useCopilot();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!open) return null;

  const handleApply = (cfg) => {
    setConfig({ ...config, ...cfg });
  };

  const handleSend = () => {
    if (!input.trim() || streaming) return;
    sendMessage(input);
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={{
      width: 340,
      flexShrink: 0,
      background: "#ffffff",
      borderLeft: "1px solid #e0e0e8",
      display: "flex",
      flexDirection: "column",
      color: "#1a1a2e",
      fontFamily: "'Segoe UI',-apple-system,sans-serif",
    }}>
      {/* Header */}
      <div style={{
        height: 36,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 12px",
        borderBottom: "1px solid #e0e0e8",
        background: "#f5f6f8",
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.06em" }}>
          AI COPILOT
        </span>
        <button
          onClick={clearChat}
          style={{
            background: "transparent",
            border: "1px solid #d0d0d8",
            color: "#555",
            fontSize: 10,
            padding: "3px 9px",
            borderRadius: 3,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          CLEAR
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1,
        overflowY: "auto",
        padding: 12,
        background: "#ffffff",
      }}>
        {messages.length === 0 ? (
          <div style={{ color: "#888", fontSize: 12 }}>
            <div style={{ marginBottom: 10, lineHeight: 1.5 }}>
              Ask the copilot to build a chart, or pose a question about the fleet.
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#666", letterSpacing: "0.06em", marginBottom: 6 }}>
              TRY:
            </div>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => sendMessage(ex)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "#f5f6f8",
                  border: "1px solid #e0e0e8",
                  borderRadius: 5,
                  padding: "7px 10px",
                  marginBottom: 6,
                  fontSize: 11,
                  color: "#1a1a2e",
                  cursor: "pointer",
                }}
              >
                {ex}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <MessageBubble key={i} msg={m} onApply={handleApply} />
          ))
        )}
      </div>

      {/* Input */}
      <div style={{
        flexShrink: 0,
        borderTop: "1px solid #e0e0e8",
        padding: 10,
        display: "flex",
        gap: 6,
        background: "#f5f6f8",
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={streaming}
          placeholder={streaming ? "Thinking…" : "Ask about your fleet…"}
          style={{
            flex: 1,
            background: "#ffffff",
            border: "1px solid #d0d0d8",
            borderRadius: 4,
            padding: "6px 9px",
            fontSize: 12,
            color: "#1a1a2e",
            outline: "none",
          }}
        />
        <button
          onClick={handleSend}
          disabled={streaming || !input.trim()}
          style={{
            background: streaming || !input.trim() ? "#b0c4de" : "#0078D4",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            padding: "0 14px",
            fontSize: 11,
            fontWeight: 700,
            cursor: streaming || !input.trim() ? "default" : "pointer",
            letterSpacing: "0.05em",
          }}
        >
          SEND
        </button>
      </div>
    </div>
  );
}
