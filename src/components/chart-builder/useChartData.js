import { useMemo } from "react";
import { useFleetData } from "../../hooks/useFleet";

// Columns we expose to the chart builder. Keep in sync with fleet row shape.
// ASCII-only labels — these flow through the same data layer as RamDb queries.
export const COLUMN_DEFS = [
  { key: "id", label: "Truck ID", type: "string" },
  { key: "driver", label: "Driver", type: "string" },
  { key: "route", label: "Route", type: "string" },
  { key: "routeId", label: "Route ID", type: "string" },
  { key: "status", label: "Status", type: "string" },
  { key: "cargo", label: "Cargo", type: "string" },
  { key: "lat", label: "Latitude", type: "number" },
  { key: "lng", label: "Longitude", type: "number" },
  { key: "progress", label: "Progress", type: "number" },
  { key: "displaySpeed", label: "Speed (mph)", type: "number" },
  { key: "fuel", label: "Fuel %", type: "number" },
  { key: "temp", label: "Temp (F)", type: "number" },
  { key: "hosRemaining", label: "HOS Remaining", type: "number" },
  { key: "milesNextService", label: "Miles To Service", type: "number" },
];

const numericCoerce = (v) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

const aggregate = (vals, op) => {
  if (vals.length === 0) return 0;
  switch (op) {
    case "sum": return vals.reduce((a, b) => a + b, 0);
    case "avg": return vals.reduce((a, b) => a + b, 0) / vals.length;
    case "min": return Math.min(...vals);
    case "max": return Math.max(...vals);
    case "count": return vals.length;
    default: return vals.reduce((a, b) => a + b, 0);
  }
};

const colDef = (key) => COLUMN_DEFS.find((c) => c.key === key);

const passesFilters = (row, filters) => {
  for (const f of filters) {
    const cd = colDef(f.column);
    if (!cd) continue;
    const v = row[f.column];
    if (cd.type === "number") {
      const n = numericCoerce(v);
      if (f.min != null && f.min !== "" && n < parseFloat(f.min)) return false;
      if (f.max != null && f.max !== "" && n > parseFloat(f.max)) return false;
    } else {
      if (f.values && f.values.length > 0 && !f.values.includes(String(v))) return false;
    }
  }
  return true;
};

// useChartData consumes the same react-query cache the AG Grid / Fleet Table uses.
// No extra fetching, no new endpoints.
export function useChartData(config) {
  const { data: fleet = [], isLoading } = useFleetData();

  const columnValues = useMemo(() => {
    const out = {};
    for (const c of COLUMN_DEFS) {
      if (c.type === "string") {
        out[c.key] = Array.from(new Set(fleet.map((r) => String(r[c.key])))).sort();
      }
    }
    return out;
  }, [fleet]);

  const points = useMemo(() => {
    if (!config?.x || !config?.y) return [];
    const filtered = fleet.filter((r) => passesFilters(r, config.filters || []));
    const xDef = colDef(config.x);
    const yDef = colDef(config.y);
    if (!xDef || !yDef) return [];

    // Scatter: raw point cloud, no aggregation.
    if (config.chartType === "scatter") {
      return filtered.map((r) => ({
        x: numericCoerce(r[config.x]),
        y: numericCoerce(r[config.y]),
        group: config.groupBy ? String(r[config.groupBy]) : null,
        label: r.id,
      }));
    }

    // Group rows by X (and optional groupBy) then aggregate Y.
    const buckets = new Map();
    for (const r of filtered) {
      const xv = String(r[config.x]);
      const gv = config.groupBy ? String(r[config.groupBy]) : "__all__";
      const k = xv + "\u0000" + gv;
      if (!buckets.has(k)) buckets.set(k, { x: xv, group: gv, ys: [] });
      buckets.get(k).ys.push(numericCoerce(r[config.y]));
    }
    const rows = Array.from(buckets.values()).map((b) => ({
      x: b.x,
      group: b.group === "__all__" ? null : b.group,
      y: aggregate(b.ys, config.agg || "sum"),
    }));

    // Stable X ordering: numeric sort if X is numeric, else lexical.
    rows.sort((a, b) => {
      if (xDef.type === "number") return parseFloat(a.x) - parseFloat(b.x);
      return a.x.localeCompare(b.x);
    });
    return rows;
  }, [fleet, config]);

  return { points, columnValues, isLoading, rowCount: fleet.length };
}
