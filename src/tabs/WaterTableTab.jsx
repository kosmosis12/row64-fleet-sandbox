import { useState, useMemo } from "react";
import { useWaterData } from "../components/water-chart-builder/useWaterChartData";
import { STATUS_COLORS, PRIORITY_COLORS } from "../data/water";

const COLUMNS = [
  { key: "id", label: "Work Order", width: 100 },
  { key: "type", label: "Type", width: 130 },
  { key: "status", label: "Status", width: 110 },
  { key: "priority", label: "Priority", width: 100 },
  { key: "crew", label: "Crew", width: 85 },
  { key: "serviceArea", label: "Service Area", width: 130 },
  { key: "pressurePSI", label: "PSI", width: 65, numeric: true },
  { key: "flowGPM", label: "GPM", width: 70, numeric: true },
  { key: "pipeMaterial", label: "Pipe", width: 100 },
  { key: "diameterInch", label: "Dia (in)", width: 75, numeric: true },
  { key: "estimatedLossGPD", label: "Loss (GPD)", width: 95, numeric: true },
  { key: "assignedTech", label: "Assigned Tech", width: 140 },
  { key: "scheduledDate", label: "Scheduled", width: 105 },
];

export default function WaterTableTab() {
  const { data: rows = [] } = useWaterData();
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [filter, setFilter] = useState("");

  const sorted = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = q
      ? rows.filter((r) =>
          Object.values(r).some((v) => String(v).toLowerCase().includes(q))
        )
      : rows;
    const copy = filtered.slice();
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [rows, sortKey, sortDir, filter]);

  const toggleSort = (k) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

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
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 36,
          background: "#f8f9fc",
          display: "flex",
          alignItems: "center",
          padding: "0 8px",
          gap: 8,
          borderBottom: "1px solid #e8eaef",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            background: "#0078D4",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: 3,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.06em",
          }}
        >
          WATER WORK ORDERS
        </div>
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by crew, area, tech, material..."
          style={{
            padding: "4px 10px",
            fontSize: 11,
            border: "1px solid #ddd",
            borderRadius: 4,
            width: 260,
            background: "#fff",
          }}
        />
        <div
          style={{
            fontSize: 9,
            color: "#888",
            fontFamily: "monospace",
            marginLeft: "auto",
          }}
        >
          {sorted.length} rows · click headers to sort
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            tableLayout: "fixed",
          }}
        >
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  onClick={() => toggleSort(c.key)}
                  style={{
                    width: c.width,
                    background: "#f0f2f8",
                    border: "1px solid #e0e0e8",
                    padding: "6px 8px",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#555",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    cursor: "pointer",
                    userSelect: "none",
                    letterSpacing: "0.03em",
                    textAlign: c.numeric ? "right" : "left",
                  }}
                >
                  {c.label}
                  {sortKey === c.key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => (
              <tr
                key={r.id}
                style={{
                  background:
                    r.priority === "Emergency"
                      ? "#fef2f2"
                      : r.status === "Escalated"
                      ? "#fff7ed"
                      : i % 2 === 0
                      ? "#fff"
                      : "#fafbfc",
                }}
              >
                {COLUMNS.map((c) => {
                  const v = r[c.key];
                  let style = {
                    border: "1px solid #e8eaef",
                    padding: "5px 8px",
                    fontSize: 11,
                    color: "#333",
                    fontFamily: c.numeric || c.key === "id"
                      ? "'JetBrains Mono',Consolas,monospace"
                      : "'Segoe UI',sans-serif",
                    textAlign: c.numeric ? "right" : "left",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  };
                  if (c.key === "status") {
                    style.color = STATUS_COLORS[v] || "#333";
                    style.fontWeight = 700;
                  }
                  if (c.key === "priority") {
                    style.color = PRIORITY_COLORS[v] || "#333";
                    style.fontWeight = 700;
                  }
                  if (c.key === "id") style.fontWeight = 700;
                  return (
                    <td key={c.key} style={style} title={String(v)}>
                      {v}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
