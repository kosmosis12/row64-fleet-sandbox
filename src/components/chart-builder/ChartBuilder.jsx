import { useState, useRef, useEffect } from "react";
import { useChartData, COLUMN_DEFS } from "./useChartData";
import ConfigPanel from "./ConfigPanel";
import ChartRenderer from "./ChartRenderer";
import CopilotDrawer from "./CopilotDrawer";

const colLabel = (k) => COLUMN_DEFS.find((c) => c.key === k)?.label ?? k;

export default function ChartBuilder({ onMarkDirty }) {
  const [collapsed, setCollapsed] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [config, setConfig] = useState({
    chartType: "bar",
    x: "status",
    y: "fuel",
    groupBy: null,
    agg: "avg",
    filters: [],
  });
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 800, h: 500 });

  const handleConfig = (next) => {
    setConfig(next);
    if (onMarkDirty) onMarkDirty();
  };

  const { points, columnValues, rowCount } = useChartData(config);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setDims({ w: Math.max(300, Math.floor(e.contentRect.width) - 32), h: Math.max(240, Math.floor(e.contentRect.height) - 80) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sidebarWidth = collapsed ? 36 : 260;

  return (
    <div style={{
      width: "100%", height: "100%", background: "#ffffff", borderRadius: 4,
      border: "1px solid #e0e0e8", display: "flex", overflow: "hidden", color: "#1a1a2e",
      fontFamily: "'Segoe UI',-apple-system,sans-serif",
    }}>
      {/* Collapsible sidebar */}
      <div style={{
        width: sidebarWidth, flexShrink: 0, background: "#f5f6f8",
        borderRight: "1px solid #e0e0e8", display: "flex", flexDirection: "column",
        transition: "width 0.18s ease",
      }}>
        <div style={{
          height: 36, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? 0 : "0 12px", borderBottom: "1px solid #e0e0e8", flexShrink: 0,
        }}>
          {!collapsed && <span style={{ fontSize: 11, fontWeight: 700, color: "#444", letterSpacing: "0.06em" }}>CHART BUILDER</span>}
          <button onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand" : "Collapse"} style={{
            background: "transparent", border: "none", color: "#888", cursor: "pointer",
            fontSize: 14, padding: "2px 6px",
          }}>{collapsed ? "›" : "‹"}</button>
        </div>
        {!collapsed && (
          <div style={{ flex: 1, overflow: "hidden" }}>
            <ConfigPanel config={config} setConfig={handleConfig} columnValues={columnValues} />
          </div>
        )}
      </div>

      {/* Live preview pane */}
      <div ref={containerRef} style={{ flex: 1, display: "flex", flexDirection: "column", padding: 16, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>
              {config.chartType !== "scatter" ? `${config.agg.toUpperCase()} of ${colLabel(config.y)}` : colLabel(config.y)}
              {" by "}{colLabel(config.x)}
              {config.groupBy ? ` / ${colLabel(config.groupBy)}` : ""}
            </div>
            <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>
              {points.length} series points · {rowCount} source rows · live preview
            </div>
          </div>
          <button
            onClick={() => setCopilotOpen((v) => !v)}
            title="Toggle AI Copilot"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 20,
              background: copilotOpen ? "#0078D4" : "#f0f1f3",
              color: copilotOpen ? "#ffffff" : "#1a1a2e",
              border: `1px solid ${copilotOpen ? "#0078D4" : "#d0d0d8"}`,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            ✨ AI {copilotOpen ? "ON" : "OFF"}
          </button>
        </div>
        <div style={{ flex: 1, background: "#fafbfc", border: "1px solid #e0e0e8", borderRadius: 3, padding: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <ChartRenderer
            chartType={config.chartType}
            points={points}
            xLabel={colLabel(config.x)}
            yLabel={colLabel(config.y)}
            width={dims.w}
            height={dims.h}
          />
        </div>
      </div>

      <CopilotDrawer
        open={copilotOpen}
        config={config}
        setConfig={handleConfig}
      />
    </div>
  );
}
