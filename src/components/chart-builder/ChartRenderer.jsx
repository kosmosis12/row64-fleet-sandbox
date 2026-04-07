import { useEffect, useRef } from "react";

const PALETTE = ["#0078D4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

// Canvas-based renderer. Matches the existing app's chart approach (no recharts in deps,
// task forbids D3 even though it's installed). Supports bar, line, scatter, heatmap.
export default function ChartRenderer({ chartType, points, xLabel, yLabel, width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (!points || points.length === 0) {
      ctx.fillStyle = "#9898b0";
      ctx.font = "12px 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No data — pick X / Y columns", width / 2, height / 2);
      return;
    }

    const pad = { top: 24, right: 20, bottom: 50, left: 64 };
    const cw = width - pad.left - pad.right;
    const ch = height - pad.top - pad.bottom;

    ctx.strokeStyle = "#3a3a52";
    ctx.lineWidth = 0.5;
    ctx.font = "10px 'Segoe UI', sans-serif";
    ctx.fillStyle = "#9898b0";

    const drawAxisLabels = (xs, yMax, yMin = 0) => {
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + ch - (ch * i / 4);
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + cw, y); ctx.stroke();
        const val = yMin + (yMax - yMin) * i / 4;
        ctx.fillStyle = "#9898b0"; ctx.textAlign = "right";
        ctx.fillText(val.toFixed(val > 100 ? 0 : 1), pad.left - 6, y + 3);
      }
      ctx.fillStyle = "#9898b0"; ctx.textAlign = "center";
      ctx.fillText(yLabel, 12, pad.top - 8);
      ctx.fillText(xLabel, pad.left + cw / 2, height - 8);
    };

    if (chartType === "bar") {
      // Group bars by x; if multiple groups, stack-side-by-side.
      const xs = Array.from(new Set(points.map((p) => p.x)));
      const groups = Array.from(new Set(points.map((p) => p.group ?? "value")));
      const yMax = Math.max(...points.map((p) => p.y), 1) * 1.15;
      drawAxisLabels(xs, yMax);
      const slot = cw / xs.length;
      const bw = (slot * 0.7) / groups.length;
      xs.forEach((xv, xi) => {
        groups.forEach((gv, gi) => {
          const pt = points.find((p) => p.x === xv && (p.group ?? "value") === gv);
          if (!pt) return;
          const x = pad.left + xi * slot + slot * 0.15 + gi * bw;
          const bh = (pt.y / yMax) * ch;
          const y = pad.top + ch - bh;
          ctx.fillStyle = PALETTE[gi % PALETTE.length];
          ctx.fillRect(x, y, bw - 1, bh);
        });
        ctx.fillStyle = "#9898b0"; ctx.textAlign = "center";
        const lab = String(xv);
        ctx.fillText(lab.length > 10 ? lab.slice(0, 9) + "…" : lab, pad.left + xi * slot + slot / 2, pad.top + ch + 14);
      });
      // Legend
      groups.forEach((gv, gi) => {
        const lx = pad.left + gi * 90;
        ctx.fillStyle = PALETTE[gi % PALETTE.length];
        ctx.fillRect(lx, height - 24, 10, 10);
        ctx.fillStyle = "#cfcfe0"; ctx.textAlign = "left";
        ctx.fillText(String(gv), lx + 14, height - 15);
      });
    } else if (chartType === "line") {
      const xs = Array.from(new Set(points.map((p) => p.x)));
      const groups = Array.from(new Set(points.map((p) => p.group ?? "value")));
      const yMax = Math.max(...points.map((p) => p.y), 1) * 1.15;
      drawAxisLabels(xs, yMax);
      const step = xs.length > 1 ? cw / (xs.length - 1) : 0;
      groups.forEach((gv, gi) => {
        ctx.strokeStyle = PALETTE[gi % PALETTE.length];
        ctx.lineWidth = 2;
        ctx.beginPath();
        let started = false;
        xs.forEach((xv, xi) => {
          const pt = points.find((p) => p.x === xv && (p.group ?? "value") === gv);
          if (!pt) return;
          const x = pad.left + xi * step;
          const y = pad.top + ch - (pt.y / yMax) * ch;
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        });
        ctx.stroke();
      });
      xs.forEach((xv, xi) => {
        ctx.fillStyle = "#9898b0"; ctx.textAlign = "center";
        const lab = String(xv);
        ctx.fillText(lab.length > 10 ? lab.slice(0, 9) + "…" : lab, pad.left + xi * step, pad.top + ch + 14);
      });
    } else if (chartType === "scatter") {
      const xVals = points.map((p) => p.x);
      const yVals = points.map((p) => p.y);
      const xMin = Math.min(...xVals), xMax = Math.max(...xVals) || 1;
      const yMin = Math.min(...yVals), yMax = Math.max(...yVals) || 1;
      const xRange = xMax - xMin || 1;
      const yRange = yMax - yMin || 1;
      drawAxisLabels(null, yMax, yMin);
      // X tick labels
      for (let i = 0; i <= 4; i++) {
        const x = pad.left + (cw * i / 4);
        const v = xMin + (xRange * i / 4);
        ctx.fillStyle = "#9898b0"; ctx.textAlign = "center";
        ctx.fillText(v.toFixed(1), x, pad.top + ch + 14);
      }
      const groups = Array.from(new Set(points.map((p) => p.group ?? "value")));
      points.forEach((p) => {
        const gi = groups.indexOf(p.group ?? "value");
        const x = pad.left + ((p.x - xMin) / xRange) * cw;
        const y = pad.top + ch - ((p.y - yMin) / yRange) * ch;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = PALETTE[gi % PALETTE.length] + "cc";
        ctx.fill();
      });
    } else if (chartType === "heatmap") {
      // Heatmap: X bins vs group bins, intensity = y aggregate.
      const xs = Array.from(new Set(points.map((p) => p.x)));
      const groups = Array.from(new Set(points.map((p) => p.group ?? "value")));
      const yMax = Math.max(...points.map((p) => p.y), 1);
      const cellW = cw / xs.length;
      const cellH = ch / groups.length;
      xs.forEach((xv, xi) => {
        groups.forEach((gv, gi) => {
          const pt = points.find((p) => p.x === xv && (p.group ?? "value") === gv);
          const intensity = pt ? pt.y / yMax : 0;
          const r = Math.round(0 + intensity * 0);
          const g = Math.round(120 + intensity * 60);
          const b = Math.round(212);
          ctx.fillStyle = `rgba(${r},${g},${b},${0.15 + intensity * 0.85})`;
          ctx.fillRect(pad.left + xi * cellW, pad.top + gi * cellH, cellW - 1, cellH - 1);
          if (pt) {
            ctx.fillStyle = intensity > 0.55 ? "#fff" : "#cfcfe0";
            ctx.font = "10px 'Segoe UI', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(pt.y.toFixed(0), pad.left + xi * cellW + cellW / 2, pad.top + gi * cellH + cellH / 2 + 3);
          }
        });
        ctx.fillStyle = "#9898b0"; ctx.textAlign = "center";
        const lab = String(xv);
        ctx.fillText(lab.length > 8 ? lab.slice(0, 7) + "…" : lab, pad.left + xi * cellW + cellW / 2, pad.top + ch + 14);
      });
      groups.forEach((gv, gi) => {
        ctx.fillStyle = "#9898b0"; ctx.textAlign = "right";
        const lab = String(gv);
        ctx.fillText(lab.length > 10 ? lab.slice(0, 9) + "…" : lab, pad.left - 6, pad.top + gi * cellH + cellH / 2 + 3);
      });
      ctx.fillStyle = "#9898b0"; ctx.textAlign = "center";
      ctx.fillText(xLabel, pad.left + cw / 2, height - 8);
    }
  }, [chartType, points, xLabel, yLabel, width, height]);

  return <canvas ref={canvasRef} style={{ width, height, display: "block" }} />;
}
