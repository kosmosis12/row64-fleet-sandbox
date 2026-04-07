import { COLUMN_DEFS } from "./useChartData";

const CHART_TYPES = [
  { id: "bar", label: "Bar" },
  { id: "line", label: "Line" },
  { id: "scatter", label: "Scatter" },
  { id: "heatmap", label: "Heatmap" },
];

const AGGS = ["sum", "avg", "count", "min", "max"];

const labelStyle = { fontSize: 10, fontWeight: 700, color: "#666", letterSpacing: "0.06em", display: "block", marginBottom: 4, textTransform: "uppercase" };
const inputStyle = { width: "100%", padding: "5px 8px", background: "#ffffff", border: "1px solid #d0d0dc", borderRadius: 3, fontSize: 11, color: "#1a1a2e", boxSizing: "border-box" };
const sectionStyle = { padding: "10px 12px", borderBottom: "1px solid #e0e0e8" };

const colDef = (k) => COLUMN_DEFS.find((c) => c.key === k);

export default function ConfigPanel({ config, setConfig, columnValues }) {
  const update = (patch) => setConfig({ ...config, ...patch });

  const addFilter = () => {
    const used = new Set(config.filters.map((f) => f.column));
    const next = COLUMN_DEFS.find((c) => !used.has(c.key));
    if (!next) return;
    update({ filters: [...config.filters, { column: next.key, min: "", max: "", values: [] }] });
  };

  const updateFilter = (i, patch) => {
    const filters = config.filters.slice();
    filters[i] = { ...filters[i], ...patch };
    update({ filters });
  };

  const removeFilter = (i) => {
    update({ filters: config.filters.filter((_, idx) => idx !== i) });
  };

  return (
    <div style={{ width: "100%", height: "100%", overflowY: "auto", background: "#f5f6f8", color: "#1a1a2e" }}>
      <div style={sectionStyle}>
        <div style={labelStyle}>Chart Type</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {CHART_TYPES.map((ct) => (
            <button key={ct.id} onClick={() => update({ chartType: ct.id })} style={{
              padding: "6px 8px", fontSize: 11, fontWeight: 600, cursor: "pointer", borderRadius: 3,
              border: "1px solid " + (config.chartType === ct.id ? "#0078D4" : "#d0d0dc"),
              background: config.chartType === ct.id ? "#0078D4" : "#ffffff",
              color: config.chartType === ct.id ? "#fff" : "#444",
            }}>{ct.label}</button>
          ))}
        </div>
      </div>

      <div style={sectionStyle}>
        <div style={labelStyle}>X Axis</div>
        <select value={config.x || ""} onChange={(e) => update({ x: e.target.value })} style={inputStyle}>
          <option value="">— select —</option>
          {COLUMN_DEFS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </select>

        <div style={{ ...labelStyle, marginTop: 10 }}>Y Axis</div>
        <select value={config.y || ""} onChange={(e) => update({ y: e.target.value })} style={inputStyle}>
          <option value="">— select —</option>
          {COLUMN_DEFS.filter((c) => c.type === "number").map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>

        <div style={{ ...labelStyle, marginTop: 10 }}>Group / Color By</div>
        <select value={config.groupBy || ""} onChange={(e) => update({ groupBy: e.target.value || null })} style={inputStyle}>
          <option value="">(none)</option>
          {COLUMN_DEFS.filter((c) => c.type === "string").map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>

        <div style={{ ...labelStyle, marginTop: 10 }}>Aggregation</div>
        <select value={config.agg} onChange={(e) => update({ agg: e.target.value })} style={inputStyle}
          disabled={config.chartType === "scatter"}>
          {AGGS.map((a) => <option key={a} value={a}>{a.toUpperCase()}</option>)}
        </select>
      </div>

      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ ...labelStyle, marginBottom: 0 }}>Filters</div>
          <button onClick={addFilter} style={{
            background: "#0078D4", color: "#fff", border: "none", borderRadius: 3,
            padding: "3px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer",
          }}>+ Add</button>
        </div>
        {config.filters.length === 0 && (
          <div style={{ fontSize: 10, color: "#999", fontStyle: "italic" }}>No filters</div>
        )}
        {config.filters.map((f, i) => {
          const cd = colDef(f.column);
          return (
            <div key={i} style={{ marginBottom: 8, padding: 8, background: "#ffffff", border: "1px solid #d0d0dc", borderRadius: 3 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                <select value={f.column} onChange={(e) => updateFilter(i, { column: e.target.value, min: "", max: "", values: [] })} style={{ ...inputStyle, flex: 1 }}>
                  {COLUMN_DEFS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
                <button onClick={() => removeFilter(i)} style={{
                  background: "transparent", color: "#ef4444", border: "1px solid #d0d0dc",
                  borderRadius: 3, padding: "0 8px", fontSize: 12, cursor: "pointer",
                }}>×</button>
              </div>
              {cd?.type === "number" ? (
                <div style={{ display: "flex", gap: 4 }}>
                  <input type="number" placeholder="min" value={f.min} onChange={(e) => updateFilter(i, { min: e.target.value })} style={inputStyle} />
                  <input type="number" placeholder="max" value={f.max} onChange={(e) => updateFilter(i, { max: e.target.value })} style={inputStyle} />
                </div>
              ) : (
                <div style={{ maxHeight: 90, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                  {(columnValues[f.column] || []).map((v) => {
                    const checked = f.values.includes(v);
                    return (
                      <label key={v} style={{ fontSize: 10, color: "#444", display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                        <input type="checkbox" checked={checked} onChange={(e) => {
                          const values = e.target.checked ? [...f.values, v] : f.values.filter((x) => x !== v);
                          updateFilter(i, { values });
                        }} />
                        {v}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
