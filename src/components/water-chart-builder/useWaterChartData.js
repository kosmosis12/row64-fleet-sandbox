import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateWaterData } from "../../data/water";

// Columns exposed to the water chart builder. Matches water.js row shape.
export const COLUMN_DEFS = [
  { key: "id", label: "Work Order", type: "string" },
  { key: "type", label: "Order Type", type: "string" },
  { key: "status", label: "Status", type: "string" },
  { key: "priority", label: "Priority", type: "string" },
  { key: "crew", label: "Crew", type: "string" },
  { key: "serviceArea", label: "Service Area", type: "string" },
  { key: "pipeMaterial", label: "Pipe Material", type: "string" },
  { key: "assignedTech", label: "Assigned Tech", type: "string" },
  { key: "lat", label: "Latitude", type: "number" },
  { key: "lng", label: "Longitude", type: "number" },
  { key: "pressurePSI", label: "Pressure (PSI)", type: "number" },
  { key: "flowGPM", label: "Flow (GPM)", type: "number" },
  { key: "meterReading", label: "Meter Reading", type: "number" },
  { key: "pipeAgeDays", label: "Pipe Age (days)", type: "number" },
  { key: "diameterInch", label: "Diameter (in)", type: "number" },
  { key: "estimatedLossGPD", label: "Est Loss (GPD)", type: "number" },
];

const numericCoerce = (v) => {
  if (typeof v === "boolean") return v ? 1 : 0;
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

// Shared react-query cache key. Matches what App.jsx seeds on init.
export const WATER_QUERY_KEY = ["r64", "water", "workorders"];

export function useWaterData() {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: WATER_QUERY_KEY,
    queryFn: async () => {
      const cached = queryClient.getQueryData(WATER_QUERY_KEY);
      if (cached) return cached;
      return generateWaterData();
    },
    staleTime: Infinity,
    refetchInterval: false,
  });
}

export function useWaterChartData(config) {
  const { data: water = [], isLoading } = useWaterData();

  const columnValues = useMemo(() => {
    const out = {};
    for (const c of COLUMN_DEFS) {
      if (c.type === "string") {
        out[c.key] = Array.from(new Set(water.map((r) => String(r[c.key])))).sort();
      }
    }
    return out;
  }, [water]);

  const points = useMemo(() => {
    if (!config?.x || !config?.y) return [];
    const filtered = water.filter((r) => passesFilters(r, config.filters || []));
    const xDef = colDef(config.x);
    const yDef = colDef(config.y);
    if (!xDef || !yDef) return [];

    if (config.chartType === "scatter") {
      return filtered.map((r) => ({
        x: numericCoerce(r[config.x]),
        y: numericCoerce(r[config.y]),
        group: config.groupBy ? String(r[config.groupBy]) : null,
        label: r.id,
      }));
    }

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

    rows.sort((a, b) => {
      if (xDef.type === "number") return parseFloat(a.x) - parseFloat(b.x);
      return a.x.localeCompare(b.x);
    });
    return rows;
  }, [water, config]);

  return { points, columnValues, isLoading, rowCount: water.length };
}
