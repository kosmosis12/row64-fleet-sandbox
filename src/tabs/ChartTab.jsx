import { useState, useRef, useEffect, useCallback } from "react";

const CHART_TYPES = [
  { id: "bar", icon: "/icons/bar-chart.png", label: "Bar Chart" },
  { id: "line", icon: "/icons/line-chart.png", label: "Line Chart" },
  { id: "pie", icon: "/icons/bar-chart.png", label: "Pie Chart" },
  { id: "scatter", icon: "/icons/scatter.png", label: "Scatter Plot" },
  { id: "area", icon: "/icons/area-chart.png", label: "Area Chart" },
  { id: "hbar", icon: "/icons/bar-chart.png", label: "Horizontal Bar" },
];

const SAMPLE_DATA = {
  bar: { labels: ["Q1", "Q2", "Q3", "Q4"], values: [2400, 1800, 3200, 2900], colors: ["#0078D4", "#00B4D8", "#0096C7", "#023E8A"] },
  line: { labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], values: [120, 190, 150, 220, 280, 310], colors: ["#0078D4"] },
  pie: { labels: ["Active", "Idle", "Maintenance", "Offline"], values: [45, 25, 18, 12], colors: ["#10b981", "#f59e0b", "#6366f1", "#ef4444"] },
  scatter: { points: Array.from({ length: 40 }, () => ({ x: Math.random() * 100, y: Math.random() * 100 })), colors: ["#0078D4"] },
  area: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], values: [30, 45, 28, 55, 43, 65, 50], colors: ["#0078D4"] },
  hbar: { labels: ["Route A", "Route B", "Route C", "Route D", "Route E"], values: [87, 73, 92, 61, 78], colors: ["#10b981", "#0078D4", "#6366f1", "#f59e0b", "#ef4444"] },
};

function CanvasChart({ type, width, height }) {
  const canvasRef = useRef(null);
  const data = SAMPLE_DATA[type];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const pad = { top: 30, right: 20, bottom: 40, left: 50 };
    const cw = width - pad.left - pad.right;
    const ch = height - pad.top - pad.bottom;

    // Grid + axis styling
    ctx.strokeStyle = "#e8eaef";
    ctx.lineWidth = 0.5;
    ctx.font = "10px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#999";

    if (type === "bar") {
      const max = Math.max(...data.values) * 1.15;
      const bw = cw / data.labels.length * 0.6;
      const gap = cw / data.labels.length * 0.4;
      // Grid
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + ch - (ch * i / 4);
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cw, y); ctx.stroke();
        ctx.fillText(Math.round(max * i / 4), 5, y + 4);
      }
      // Bars
      data.values.forEach((v, i) => {
        const x = pad.left + i * (bw + gap) + gap / 2;
        const bh = (v / max) * ch;
        const y = pad.top + ch - bh;
        ctx.fillStyle = data.colors[i % data.colors.length];
        ctx.beginPath();
        ctx.roundRect(x, y, bw, bh, [4, 4, 0, 0]);
        ctx.fill();
        ctx.fillStyle = "#666";
        ctx.textAlign = "center";
        ctx.fillText(data.labels[i], x + bw / 2, pad.top + ch + 18);
        ctx.fillStyle = "#333";
        ctx.font = "bold 11px 'Segoe UI', sans-serif";
        ctx.fillText(v.toLocaleString(), x + bw / 2, y - 6);
        ctx.font = "10px 'Segoe UI', sans-serif";
      });
    } else if (type === "line" || type === "area") {
      const max = Math.max(...data.values) * 1.2;
      const step = cw / (data.labels.length - 1);
      // Grid
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + ch - (ch * i / 4);
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cw, y); ctx.stroke();
        ctx.fillStyle = "#999"; ctx.fillText(Math.round(max * i / 4), 5, y + 4);
      }
      // Area fill
      if (type === "area") {
        ctx.beginPath();
        ctx.moveTo(pad.left, pad.top + ch);
        data.values.forEach((v, i) => {
          ctx.lineTo(pad.left + i * step, pad.top + ch - (v / max) * ch);
        });
        ctx.lineTo(pad.left + (data.values.length - 1) * step, pad.top + ch);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
        grad.addColorStop(0, "rgba(0,120,212,0.25)");
        grad.addColorStop(1, "rgba(0,120,212,0.02)");
        ctx.fillStyle = grad;
        ctx.fill();
      }
      // Line
      ctx.beginPath();
      ctx.strokeStyle = data.colors[0];
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      data.values.forEach((v, i) => {
        const x = pad.left + i * step;
        const y = pad.top + ch - (v / max) * ch;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      // Dots + labels
      data.values.forEach((v, i) => {
        const x = pad.left + i * step;
        const y = pad.top + ch - (v / max) * ch;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = data.colors[0]; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
        ctx.fillStyle = "#666"; ctx.textAlign = "center"; ctx.fillText(data.labels[i], x, pad.top + ch + 18);
      });
    } else if (type === "pie") {
      const total = data.values.reduce((a, b) => a + b, 0);
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(cw, ch) / 2.5;
      let angle = -Math.PI / 2;
      data.values.forEach((v, i) => {
        const slice = (v / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, angle, angle + slice);
        ctx.closePath();
        ctx.fillStyle = data.colors[i];
        ctx.fill();
        // Label
        const mid = angle + slice / 2;
        const lx = cx + Math.cos(mid) * (r + 24);
        const ly = cy + Math.sin(mid) * (r + 24);
        ctx.fillStyle = "#333";
        ctx.font = "bold 11px 'Segoe UI', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${data.labels[i]} (${Math.round(v / total * 100)}%)`, lx, ly);
        ctx.font = "10px 'Segoe UI', sans-serif";
        angle += slice;
      });
      // Inner circle for donut effect
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
      ctx.fillStyle = "#333"; ctx.font = "bold 16px 'Segoe UI', sans-serif"; ctx.textAlign = "center";
      ctx.fillText(total, cx, cy + 6);
    } else if (type === "scatter") {
      // Grid
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + ch - (ch * i / 4);
        const x = pad.left + (cw * i / 4);
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cw, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, pad.top); ctx.lineTo(x, pad.top + ch); ctx.stroke();
        ctx.fillStyle = "#999";
        ctx.fillText(Math.round(100 * i / 4), 5, y + 4);
        ctx.textAlign = "center"; ctx.fillText(Math.round(100 * i / 4), x, pad.top + ch + 18); ctx.textAlign = "start";
      }
      // Points
      data.points.forEach((p) => {
        const x = pad.left + (p.x / 100) * cw;
        const y = pad.top + ch - (p.y / 100) * ch;
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,120,212,0.5)"; ctx.fill();
        ctx.strokeStyle = "rgba(0,120,212,0.8)"; ctx.lineWidth = 1; ctx.stroke();
      });
    } else if (type === "hbar") {
      const max = Math.max(...data.values) * 1.15;
      const bh = ch / data.labels.length * 0.65;
      const gap = ch / data.labels.length * 0.35;
      data.values.forEach((v, i) => {
        const y = pad.top + i * (bh + gap) + gap / 2;
        const bw2 = (v / max) * cw;
        ctx.fillStyle = data.colors[i % data.colors.length];
        ctx.beginPath();
        ctx.roundRect(pad.left, y, bw2, bh, [0, 4, 4, 0]);
        ctx.fill();
        ctx.fillStyle = "#666"; ctx.textAlign = "right";
        ctx.fillText(data.labels[i], pad.left - 6, y + bh / 2 + 4);
        ctx.fillStyle = "#333"; ctx.font = "bold 11px 'Segoe UI', sans-serif"; ctx.textAlign = "left";
        ctx.fillText(`${v}%`, pad.left + bw2 + 6, y + bh / 2 + 4);
        ctx.font = "10px 'Segoe UI', sans-serif";
      });
    }
  }, [type, width, height, data]);

  return <canvas ref={canvasRef} style={{ width, height }} />;
}

export default function ChartTab({ onMarkDirty }) {
  const [selectedType, setSelectedType] = useState("bar");
  const [chartTitle, setChartTitle] = useState("Fleet Analytics");
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ w: 600, h: 400 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setDims({ w: Math.floor(e.contentRect.width) - 32, h: Math.floor(e.contentRect.height) - 60 });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 4, border: "2px dashed #0078D4", display: "flex", overflow: "hidden" }}>
      <div style={{ width: 180, background: "#f8f9fc", borderRight: "1px solid #e8eaef", padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.06em", padding: "4px 8px", marginBottom: 4 }}>CHART TYPE</div>
        {CHART_TYPES.map((ct) => (
          <div key={ct.id} onClick={() => { setSelectedType(ct.id); if (onMarkDirty) onMarkDirty(); }}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 4, cursor: "pointer", background: selectedType === ct.id ? "#e8f0fe" : "transparent", fontWeight: selectedType === ct.id ? 600 : 400, transition: "all 0.12s", fontSize: 12, color: selectedType === ct.id ? "#0078D4" : "#555" }}
            onMouseEnter={(e) => { if (selectedType !== ct.id) e.currentTarget.style.background = "#eef0f5"; }}
            onMouseLeave={(e) => { if (selectedType !== ct.id) e.currentTarget.style.background = "transparent"; }}>
            <img src={ct.icon} alt={ct.label} width={18} height={18} style={{objectFit:"contain"}} /> {ct.label}
          </div>
        ))}
        <div style={{ marginTop: "auto", padding: 8 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: "#888", display: "block", marginBottom: 4 }}>Title</label>
          <input value={chartTitle} onChange={(e) => setChartTitle(e.target.value)}
            style={{ width: "100%", padding: "5px 8px", border: "1px solid #ddd", borderRadius: 3, fontSize: 11, boxSizing: "border-box" }} />
        </div>
      </div>
      <div ref={containerRef} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#333", marginBottom: 8 }}>{chartTitle}</div>
        {dims.w > 100 && <CanvasChart type={selectedType} width={Math.min(dims.w, 700)} height={Math.min(dims.h, 500)} />}
      </div>
    </div>
  );
}
