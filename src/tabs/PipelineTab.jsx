import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getDeals } from "../data/pipelineData";

const COL = createColumnHelper();
const STAGE_COLORS = {
  "Discovery": "#6366f1", "Business Value": "#0ea5e9", "Technical Eval": "#14b8a6",
  "Commercial": "#f59e0b", "Finalizing": "#22c55e", "Closed Won": "#10b981",
};
const PRI_COLORS = { high: "#ef4444", medium: "#f59e0b", low: "#94a3b8" };

const fmt = (n) => n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`;

export default function PipelineTab() {
  const deals = useMemo(() => getDeals(), []);
  const [sorting, setSorting] = useState([{ id: "stageOrder", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);

  const filtered = useMemo(() => {
    let d = deals;
    if (stageFilter !== "all") d = d.filter(x => x.stage === stageFilter);
    if (ownerFilter !== "all") d = d.filter(x => x.owner === ownerFilter);
    return d;
  }, [deals, stageFilter, ownerFilter]);

  // Metrics
  const totalPipeline = filtered.reduce((s, d) => s + (d.amount || 0), 0);
  const totalWeighted = filtered.reduce((s, d) => s + d.weighted, 0);
  const avgDays = filtered.length ? Math.round(filtered.reduce((s, d) => s + d.daysOpen, 0) / filtered.length) : 0;
  const stageData = Object.entries(filtered.reduce((acc, d) => { acc[d.stage] = (acc[d.stage] || 0) + (d.amount || 0); return acc; }, {}))
    .map(([name, value]) => ({ name, value, fill: STAGE_COLORS[name] || "#888" }));
  const ownerData = Object.entries(filtered.reduce((acc, d) => { acc[d.owner] = (acc[d.owner] || 0) + (d.amount || 0); return acc; }, {}))
    .map(([name, value]) => ({ name, value }));

  const columns = useMemo(() => [
    COL.accessor("name", {
      header: "Deal",
      cell: (info) => (
        <span style={{ fontWeight: 600, color: "#1e293b", cursor: "pointer" }}
          onClick={() => setExpanded(expanded === info.row.index ? null : info.row.index)}>
          {info.getValue()}
        </span>
      ),
      size: 280,
    }),
    COL.accessor("stage", {
      header: "Stage",
      cell: (info) => {
        const s = info.getValue();
        return <span style={{ background: STAGE_COLORS[s] || "#888", color: "#fff", padding: "2px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{s}</span>;
      },
      size: 130,
    }),
    COL.accessor("amount", {
      header: "Amount",
      cell: (info) => <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{info.getValue() ? fmt(info.getValue()) : "—"}</span>,
      size: 90,
    }),
    COL.accessor("weighted", {
      header: "Weighted",
      cell: (info) => <span style={{ fontFamily: "monospace", color: "#059669" }}>{fmt(info.getValue())}</span>,
      size: 90,
    }),
    COL.accessor("owner", { header: "Owner", size: 70 }),
    COL.accessor("daysOpen", {
      header: "Days Open",
      cell: (info) => {
        const d = info.getValue();
        const color = d > 120 ? "#ef4444" : d > 60 ? "#f59e0b" : "#64748b";
        return <span style={{ fontFamily: "monospace", color, fontWeight: d > 120 ? 700 : 400 }}>{d}</span>;
      },
      size: 80,
    }),
    COL.accessor("contacts", {
      header: "Contacts",
      cell: (info) => {
        const c = info.getValue();
        return <span style={{ color: c === 0 ? "#ef4444" : "#64748b", fontWeight: c === 0 ? 700 : 400 }}>{c === 0 ? "⚠ 0" : c}</span>;
      },
      size: 70,
    }),
    COL.accessor("priority", {
      header: "Priority",
      cell: (info) => {
        const p = info.getValue();
        if (!p) return <span style={{ color: "#cbd5e1" }}>—</span>;
        return <span style={{ color: PRI_COLORS[p] || "#888", fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{p}</span>;
      },
      size: 70,
    }),
    COL.accessor("close", {
      header: "Close Date",
      cell: (info) => {
        const v = info.getValue();
        if (!v) return <span style={{ color: "#ef4444", fontWeight: 600 }}>⚠ Missing</span>;
        return <span style={{ fontSize: 12, color: "#64748b" }}>{v}</span>;
      },
      size: 100,
    }),
  ], [expanded]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const stages = [...new Set(deals.map(d => d.stage))];
  const owners = [...new Set(deals.map(d => d.owner))];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#f8fafc", overflow: "hidden" }}>
      {/* Metrics Bar */}
      <div style={{ display: "flex", gap: 12, padding: "12px 16px", flexShrink: 0, flexWrap: "wrap" }}>
        {[
          { label: "Pipeline Total", value: fmt(totalPipeline), color: "#0078D4" },
          { label: "Weighted Value", value: fmt(totalWeighted), color: "#059669" },
          { label: "Active Deals", value: filtered.length, color: "#6366f1" },
          { label: "Avg Days Open", value: avgDays, color: avgDays > 90 ? "#ef4444" : "#64748b" },
        ].map(m => (
          <div key={m.label} style={{ flex: "1 1 140px", background: "#fff", borderRadius: 8, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: m.color, fontFamily: "monospace", marginTop: 2 }}>{m.value}</div>
          </div>
        ))}
      </div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px 8px", flexShrink: 0, alignItems: "center" }}>
        <input placeholder="Search deals..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)}
          style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, width: 200, outline: "none" }} />
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
          style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, outline: "none", background: "#fff" }}>
          <option value="all">All Stages</option>
          {stages.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)}
          style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 12, outline: "none", background: "#fff" }}>
          <option value="all">All Owners</option>
          {owners.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: "#94a3b8" }}>Synced from HubSpot • {filtered.length} deals</span>
      </div>
      {/* Table + Charts split */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", padding: "0 16px 12px", gap: 12 }}>
        {/* Table */}
        <div style={{ flex: 2, overflow: "auto", background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(h => (
                    <th key={h.id} onClick={h.column.getToggleSortingHandler()}
                      style={{ padding: "8px 10px", textAlign: "left", background: "#f1f5f9", borderBottom: "2px solid #e2e8f0",
                        cursor: "pointer", userSelect: "none", fontSize: 11, fontWeight: 700, color: "#475569",
                        textTransform: "uppercase", letterSpacing: "0.04em", position: "sticky", top: 0, zIndex: 1,
                        width: h.getSize() }}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted()] ?? ""}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, i) => (
                <>
                  <tr key={row.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 ? "#fafbfc" : "#fff" }}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} style={{ padding: "8px 10px", verticalAlign: "middle" }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                  {expanded === i && (
                    <tr key={row.id + "-detail"} style={{ background: "#f8fafc" }}>
                      <td colSpan={columns.length} style={{ padding: "12px 16px", borderBottom: "2px solid #e2e8f0" }}>
                        <div style={{ display: "flex", gap: 20, fontSize: 12 }}>
                          <div><strong>Industry:</strong> {row.original.industry}</div>
                          <div><strong>Stage Probability:</strong> {(row.original.prob * 100).toFixed(0)}%</div>
                          <div><strong>Created:</strong> {row.original.created}</div>
                          <div>
                            <a href={`https://app.hubspot.com/contacts/21279632/record/0-3/${row.original.id}`}
                              target="_blank" rel="noopener" style={{ color: "#0078D4", textDecoration: "none", fontWeight: 600 }}>
                              View in HubSpot →
                            </a>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {/* Charts sidebar */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 260, maxWidth: 360 }}>
          <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 12, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase" }}>Pipeline by Stage</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stageData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {stageData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 12, flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 8, textTransform: "uppercase" }}>By Owner</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={ownerData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} label={({ name }) => name}>
                  {ownerData.map((_, i) => <Cell key={i} fill={["#0078D4","#6366f1","#14b8a6","#f59e0b"][i % 4]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
