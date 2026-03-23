import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useCallback } from "react";

const BRIDGE = "http://localhost:8064";

async function r64(path, params = {}) {
  const url = new URL(`${BRIDGE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`R64 ${r.status}`);
  return r.json();
}

export function useBridgeHealth() {
  return useQuery({
    queryKey: ["r64", "health"],
    queryFn: () => r64("/api/health"),
    staleTime: 30000, retry: 1, refetchInterval: 30000,
  });
}

export function useFleetTelemetry(opts = {}) {
  return useQuery({
    queryKey: ["r64", "telemetry", opts.truck_id, opts.limit, opts.sort_by],
    queryFn: () => r64("/api/fleet/telemetry", opts),
    staleTime: 5000, refetchInterval: opts.poll ? 2000 : false,
  });
}

export function useFleetSummary() {
  return useQuery({
    queryKey: ["r64", "analytics", "fleet-summary"],
    queryFn: () => r64("/api/analytics/fleet-summary"),
    staleTime: 3000, refetchInterval: 5000,
  });
}

export function useRoutePerformance() {
  return useQuery({
    queryKey: ["r64", "analytics", "route-perf"],
    queryFn: () => r64("/api/analytics/route-perf"),
    staleTime: 30000,
  });
}

export function useMaintenanceLog(truck_id, priority) {
  return useQuery({
    queryKey: ["r64", "maintenance", truck_id, priority],
    queryFn: () => r64("/api/maintenance", { truck_id, priority }),
    staleTime: 60000,
  });
}

export function useIncidents(truck_id, severity) {
  return useQuery({
    queryKey: ["r64", "incidents", truck_id, severity],
    queryFn: () => r64("/api/incidents", { truck_id, severity }),
    staleTime: 10000,
  });
}

export function useFuelTransactions(truck_id) {
  return useQuery({
    queryKey: ["r64", "fuel", truck_id],
    queryFn: () => r64("/api/fuel", { truck_id }),
    staleTime: 60000,
  });
}

export function useR64Query(table, opts = {}) {
  return useQuery({
    queryKey: ["r64", "query", table, JSON.stringify(opts)],
    queryFn: () => fetch(`${BRIDGE}/api/fleet/query`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table, ...opts }),
    }).then(r => r.json()),
    enabled: !!table, staleTime: 30000,
  });
}

export function useFleetWebSocket(onUpdate) {
  const wsRef = useRef(null);
  const qc = useQueryClient();
  const cbRef = useRef(onUpdate);
  cbRef.current = onUpdate;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket("ws://localhost:8064/ws/fleet");
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "fleet_update") {
        qc.setQueryData(["r64", "telemetry", undefined, undefined, undefined],
          (old) => ({ ...old, data: msg.data, count: msg.data.length, source: "row64_ramdb" }));
        cbRef.current?.(msg.data, msg.tick);
      }
    };
    ws.onclose = () => setTimeout(connect, 2000);
    wsRef.current = ws;
  }, [qc]);

  useEffect(() => { connect(); return () => wsRef.current?.close(); }, [connect]);
  return wsRef;
}
