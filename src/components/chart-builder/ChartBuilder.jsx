import { useState, useRef, useEffect } from "react";
import { useChartData, COLUMN_DEFS } from "./useChartData";
import ConfigPanel from "./ConfigPanel";
import ChartRenderer from "./ChartRenderer";

const colLabel = (k) => COLUMN_DEFS.find((c) => c.key === k)?.label ?? k;

export default function ChartBuilder({ onMarkDirty }) {
  const [collapsed, setCollapsed] = useState(false);
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
      width: "100%", height: "100%", background: "#1e1e2e", borderRadius: 4,
      border: "1px solid #2a2a3e", display: "flex", overflow: "hidden", color: "#e8e8f0",
      fontFamily: "'Segoe UI',-apple-system,sans-serif",
    }}>
      {/* Collapsible sidebar */}
      <div style={{
        width: sidebarWidth, flexShrink: 0, background: "#252538",
        borderRight: "1px solid #2a2a3e", display: "flex", flexDirection: "column",
        transition: "width 0.18s ease",
      }}>
        <div style={{
          height: 36, display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between",
          padding: collapsed ? 0 : "0 12px", borderBottom: "1px solid #2a2a3e", flexShrink: 0,
        }}>
          {!collapsed && <span style={{ fontSize: 11, fontWeight: 700, color: "#cfcfe0", letterSpacing: "0.06em" }}>CHART BUILDER</span>}
          <button onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand" : "Collapse"} style={{
            background: "transparent", border: "none", color: "#9898b0", cursor: "pointer",
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
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
              {config.chartType !== "scatter" ? `${config.agg.toUpperCase()} of ${colLabel(config.y)}` : colLabel(config.y)}
              {" by "}{colLabel(config.x)}
              {config.groupBy ? ` / ${colLabel(config.groupBy)}` : ""}
            </div>
            <div style={{ fontSize: 10, color: "#6b6b85", marginTop: 2 }}>
              {points.length} series points · {rowCount} source rows · live preview
            </div>
          </div>
        </div>
        <div style={{ flex: 1, background: "#181826", border: "1px solid #2a2a3e", borderRadius: 3, padding: 8, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
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
    </div>
  );
}
