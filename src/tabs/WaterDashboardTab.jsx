import { useState, useMemo } from "react";
import WaterMap from "../components/WaterMap";
import { useWaterData } from "../components/water-chart-builder/useWaterChartData";
import { PRIORITY_COLORS, STATUS_COLORS } from "../data/water";

const KpiCard = ({ label, value, sub, accent }) => (
  <div
    style={{
      background: "#ffffff",
      border: "1px solid #e0e0e8",
      borderLeft: `3px solid ${accent}`,
      borderRadius: 4,
      padding: "10px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 2,
      minWidth: 0,
    }}
  >
    <div
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: "#888",
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.1 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: 10, color: "#999" }}>{sub}</div>}
  </div>
);

const MiniBarChart = ({ data, colorFn }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        const color = colorFn ? colorFn(d.label) : "#0078D4";
        return (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 110,
                fontSize: 10,
                color: "#555",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={d.label}
            >
              {d.label}
            </div>
            <div
              style={{
                flex: 1,
                height: 14,
                background: "#f1f3f7",
                borderRadius: 3,
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: color,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div
              style={{
                width: 40,
                textAlign: "right",
                fontSize: 10,
                fontFamily: "'JetBrains Mono',Consolas,monospace",
                color: "#333",
                fontWeight: 700,
              }}
            >
              {d.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Panel = ({ title, children, style }) => (
  <div
    style={{
      background: "#ffffff",
      border: "1px solid #e0e0e8",
      borderRadius: 4,
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        padding: "8px 12px",
        borderBottom: "1px solid #e0e0e8",
        fontSize: 10,
        fontWeight: 800,
        color: "#444",
        letterSpacing: "0.06em",
        background: "#f8f9fc",
        flexShrink: 0,
      }}
    >
      {title}
    </div>
    <div style={{ flex: 1, padding: 10, overflow: "auto", minHeight: 0 }}>{children}</div>
  </div>
);

export default function WaterDashboardTab() {
  const { data: orders = [] } = useWaterData();
  const [selected, setSelected] = useState(null);

  const stats = useMemo(() => {
    const total = orders.length;
    const openCount = orders.filter(
      (o) => o.status === "Open" || o.status === "In Progress"
    ).length;
    const leakCount = orders.filter((o) => o.leakDetected).length;
    const leakRate = total ? Math.round((leakCount / total) * 100) : 0;
    const avgPsi = total
      ? Math.round(orders.reduce((a, b) => a + b.pressurePSI, 0) / total)
      : 0;
    const totalLoss = orders.reduce((a, b) => a + b.estimatedLossGPD, 0);

    const byType = {};
    const byArea = {};
    for (const o of orders) {
      byType[o.type] = (byType[o.type] || 0) + 1;
      byArea[o.serviceArea] = (byArea[o.serviceArea] || 0) + 1;
    }
    const typeData = Object.entries(byType)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
    const areaData = Object.entries(byArea)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);

    const priority = orders.filter(
      (o) => o.status === "Escalated" || o.priority === "Emergency"
    );

    return {
      total,
      openCount,
      leakCount,
      leakRate,
      avgPsi,
      totalLoss,
      typeData,
      areaData,
      priority,
    };
  }, [orders]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fff",
        borderRadius: 4,
        border: "2px dashed #0078D4",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 12,
        overflow: "hidden",
      }}
    >
      {/* KPI Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 8,
          flexShrink: 0,
        }}
      >
        <KpiCard
          label="Total Work Orders"
          value={stats.total}
          sub="Across all districts"
          accent="#0078D4"
        />
        <KpiCard
          label="Open / In Progress"
          value={stats.openCount}
          sub={`${stats.total - stats.openCount} closed`}
          accent="#f59e0b"
        />
        <KpiCard
          label="Leak Detection Rate"
          value={`${stats.leakRate}%`}
          sub={`${stats.leakCount} leaks`}
          accent="#ef4444"
        />
        <KpiCard
          label="Avg Pressure"
          value={`${stats.avgPsi} PSI`}
          sub="Network average"
          accent="#10b981"
        />
        <KpiCard
          label="Est Daily Loss"
          value={`${stats.totalLoss.toLocaleString()} GPD`}
          sub="From detected leaks"
          accent="#8b5cf6"
        />
      </div>

      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 10,
          flex: 1,
          minHeight: 0,
        }}
      >
        <Panel title="FIELD MAP — WORK ORDERS" style={{ padding: 0 }}>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <div
              style={{
                position: "absolute",
                top: 10,
                right: 50,
                display: "flex",
                gap: 8,
                zIndex: 1000,
                background: "rgba(255,255,255,0.92)",
                padding: "5px 10px",
                borderRadius: 4,
                border: "1px solid #e0e0e8",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              {Object.entries(PRIORITY_COLORS).map(([k, c]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 9,
                    color: "#555",
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: c,
                    }}
                  />
                  {k}
                </div>
              ))}
            </div>
            {selected && (
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  zIndex: 1000,
                  background: "#ffffff",
                  border: "1px solid #e0e0e8",
                  borderRadius: 4,
                  padding: "8px 12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                  minWidth: 200,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{selected.id}</span>
                  <span
                    style={{
                      cursor: "pointer",
                      color: "#888",
                    }}
                    onClick={() => setSelected(null)}
                  >
                    ×
                  </span>
                </div>
                <div style={{ fontSize: 10, color: "#666" }}>
                  {selected.type} · {selected.crew}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: PRIORITY_COLORS[selected.priority],
                    fontWeight: 700,
                  }}
                >
                  {selected.priority}
                  {selected.leakDetected ? ` · ${selected.estimatedLossGPD} GPD loss` : ""}
                </div>
                <div style={{ fontSize: 10, color: "#666", marginTop: 3 }}>
                  {selected.pressurePSI} PSI · {selected.flowGPM} GPM · {selected.pipeMaterial} {selected.diameterInch}"
                </div>
              </div>
            )}
            <WaterMap orders={orders} selected={selected} onSelect={setSelected} />
          </div>
        </Panel>

        <div
          style={{
            display: "grid",
            gridTemplateRows: "1fr 1fr 1.1fr",
            gap: 10,
            minHeight: 0,
          }}
        >
          <Panel title="WORK ORDERS BY TYPE">
            <MiniBarChart data={stats.typeData} colorFn={() => "#0078D4"} />
          </Panel>
          <Panel title="WORK ORDERS BY SERVICE AREA">
            <MiniBarChart data={stats.areaData} colorFn={() => "#10b981"} />
          </Panel>
          <Panel title="PRIORITY QUEUE — ESCALATED / EMERGENCY">
            {stats.priority.length === 0 ? (
              <div style={{ fontSize: 10, color: "#888", fontStyle: "italic" }}>
                No escalated items
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {stats.priority.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelected(p)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "5px 8px",
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                      borderRadius: 3,
                      fontSize: 10,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: PRIORITY_COLORS[p.priority],
                      }}
                    />
                    <span
                      style={{
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono',Consolas,monospace",
                      }}
                    >
                      {p.id}
                    </span>
                    <span style={{ color: "#555", flex: 1 }}>{p.type}</span>
                    <span
                      style={{
                        color: STATUS_COLORS[p.status],
                        fontWeight: 700,
                        fontSize: 9,
                      }}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
