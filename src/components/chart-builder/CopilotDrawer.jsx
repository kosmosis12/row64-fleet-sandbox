import { useEffect, useRef, useState } from "react";
import { useCopilot, extractChartConfig } from "./useCopilot";

const headerStyle = {
  height: 36, display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 12px", borderBottom: "1px solid #e0e0e8", background: "#f5f6f8", flexShrink: 0,
};

const titleStyle = { fontSize: 11, fontWeight: 700, color: "#1a1a2e", letterSpacing: "0.06em" };

const btnStyle = {
  background: "transparent", border: "1px solid #e0e0e8", color: "#555",
  borderRadius: 3, padding: "3px 8px", fontSize: 10, fontWeight: 600, cursor: "pointer",
};

// Strips the ```json block from the visible bubble text so the JSON isn't shown raw.
function renderVisibleContent(text) {
  return text.replace(/```json[\s\S]*?```/gi, "").trim();
}

function Bubble({ msg, onApply, streaming }) {
  const isUser = msg.role === "user";
  const config = !isUser ? extractChartConfig(msg.content) : null;
  const visible = isUser ? msg.content : renderVisibleContent(msg.content);

  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 8 }}>
      <div style={{ maxWidth: "85%" }}>
        <div style={{
          padding: "8px 10px", borderRadius: 8, fontSize: 12, lineHeight: 1.45,
          whiteSpace: "pre-wrap", wordBreak: "break-word",
          background: isUser ? "#0078D4" : "#f0f1f3",
          color: isUser ? "#fff" : "#1a1a2e",
          border: isUser ? "none" : "1px solid #e0e0e8",
        }}>
          {visible || (streaming ? "…" : "")}
        </div>
        {config && (
          <button onClick={() => onApply(config)} style={{
            marginTop: 6, background: "#10b981", color: "#fff", border: "none",
            borderRadius: 3, padding: "4px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer",
          }}>Apply to Chart →</button>
        )}
      </div>
    </div>
  );
}

export default function CopilotDrawer({ onApplyConfig, onClose }) {
  const { messages, streaming, send, clear, error } = useCopilot();
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const submit = () => {
    if (!input.trim() || streaming) return;
    send(input);
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div style={{
      width: 340, flexShrink: 0, background: "#fff", borderLeft: "1px solid #e0e0e8",
      display: "flex", flexDirection: "column", color: "#1a1a2e",
    }}>
      <div style={headerStyle}>
        <span style={titleStyle}>AI COPILOT</span>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={clear} style={btnStyle} title="Clear conversation">Clear</button>
          <button onClick={onClose} style={btnStyle} title="Close drawer">×</button>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 12, background: "#fff" }}>
        {messages.length === 0 && (
          <div style={{ fontSize: 11, color: "#888", fontStyle: "italic", textAlign: "center", marginTop: 20 }}>
            Ask a question about the fleet or request a chart.
            <div style={{ marginTop: 10, fontStyle: "normal", color: "#aaa", fontSize: 10 }}>
              e.g. "average fuel by status"<br />
              "scatter of speed vs fuel colored by cargo"<br />
              "which routes are most delayed?"
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <Bubble
            key={i}
            msg={m}
            onApply={onApplyConfig}
            streaming={streaming && i === messages.length - 1 && m.role === "assistant"}
          />
        ))}
        {error && (
          <div style={{ fontSize: 10, color: "#ef4444", padding: 6, background: "#fef2f2", borderRadius: 3, marginTop: 6 }}>
            {error}
          </div>
        )}
      </div>

      <div style={{ padding: 10, borderTop: "1px solid #e0e0e8", background: "#f5f6f8", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={streaming ? "thinking…" : "Ask the copilot…"}
            disabled={streaming}
            style={{
              flex: 1, padding: "6px 10px", background: "#fff",
              border: "1px solid #e0e0e8", borderRadius: 3, fontSize: 12, color: "#1a1a2e",
              outline: "none",
            }}
          />
          <button
            onClick={submit}
            disabled={streaming || !input.trim()}
            style={{
              background: streaming || !input.trim() ? "#9ab8d4" : "#0078D4",
              color: "#fff", border: "none", borderRadius: 3,
              padding: "6px 14px", fontSize: 11, fontWeight: 700,
              cursor: streaming || !input.trim() ? "default" : "pointer",
            }}
          >Send</button>
        </div>
      </div>
    </div>
  );
}
