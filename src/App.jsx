import { useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { generateFleet, ROUTES, interpolateRoute } from "./data/fleet";
import { useProjectState } from "./hooks/useProjectState";
import DashboardTab from "./tabs/DashboardTab";
import DataTab from "./tabs/DataTab";
import ChartTab from "./tabs/ChartTab";
import SpreadsheetTab from "./tabs/SpreadsheetTab";
import FleetTableTab from "./tabs/FleetTableTab";
import FileTab from "./tabs/FileTab";

const R64Logo = () => (
  <svg width="28" height="20" viewBox="0 0 28 20">
    <rect width="28" height="20" rx="3" fill="#0078D4" />
    <text x="4" y="15" fontFamily="Arial Black,sans-serif" fontSize="13" fontWeight="900" fill="white">64</text>
  </svg>
);

const AIToggle = ({ enabled, onChange }) => (
  <div onClick={() => onChange(!enabled)}
    style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "3px 10px", borderRadius: 20, background: enabled ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.08)", border: `1px solid ${enabled ? "#86efac" : "#e5e7eb"}`, transition: "all 0.25s ease", userSelect: "none" }}>
    <div style={{ width: 30, height: 16, borderRadius: 8, position: "relative", background: enabled ? "#10b981" : "#d1d5db", transition: "background 0.2s ease" }}>
      <div style={{ position: "absolute", top: 2, left: enabled ? 14 : 2, width: 12, height: 12, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s ease" }} />
    </div>
    <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", color: enabled ? "#10b981" : "#9ca3af", transition: "color 0.2s ease" }}>
      AI {enabled ? "ON" : "OFF"}
    </span>
  </div>
);

export default function App() {
  const queryClient = useQueryClient();
  const project = useProjectState();
  const [fleet, setFleet] = useState(generateFleet);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [tick, setTick] = useState(0);
  const [aiEnabled, setAiEnabled] = useState(true);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        project.saveProject();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        project.newProject();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault();
        setActiveTab("File");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [project]);

  // Animate fleet
  useEffect(() => {
    const iv = setInterval(() => {
      setTick((t) => t + 1);
      setFleet((prev) => {
        const next = prev.map((v) => {
          if (v.speed === 0) return v;
          let np = v.progress + v.speed;
          if (np >= 1) np = 0.05;
          const [nLng, nLat] = interpolateRoute(ROUTES[v.routeIdx], np);
          const heading = Math.atan2(nLng - v.lng, nLat - v.lat) * (180 / Math.PI);
          return { ...v, progress: np, lat: nLat, lng: nLng, heading, waypointIndex: Math.floor(np * 10000) };
        });
        queryClient.setQueryData(["r64", "fleet", "telemetry"], next);
        return next;
      });
    }, 100);
    return () => clearInterval(iv);
  }, [queryClient]);

  const tabs = {
    File: <FileTab project={project} />,
    Data: <DataTab onMarkDirty={project.markDirty} />,
    Chart: <ChartTab onMarkDirty={project.markDirty} />,
    Spreadsheet: <SpreadsheetTab onMarkDirty={project.markDirty} />,
    "Fleet Table": <FleetTableTab fleet={fleet} />,
    Dashboard: <DashboardTab fleet={fleet} tick={tick} aiEnabled={aiEnabled} />,
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", background: "#f0f2f5", fontFamily: "'Segoe UI',-apple-system,sans-serif", overflow: "hidden", color: "#1a1a2e" }}>
      {/* Title Bar */}
      <div style={{ height: 32, background: "#1e1e2e", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", fontSize: 12, flexShrink: 0 }}>
        <R64Logo />
        <span style={{ color: "#8888a0" }}>
          Row64 - {project.projectName}{project.isDirty ? " •" : ""} (TanStack)
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ padding: "2px 10px", background: "#10b981", borderRadius: 3, color: "#fff", fontSize: 10, fontWeight: 700 }}>localhost</div>
          <span style={{ color: "#555", marginLeft: 8 }}>⌄</span>
          <span style={{ color: "#555" }}>∧</span>
          <span style={{ color: "#555" }}>✕</span>
        </div>
      </div>
      {/* Menu Bar */}
      <div style={{ height: 30, background: "#2a2a3e", display: "flex", alignItems: "center", padding: "0 8px", flexShrink: 0, borderBottom: "1px solid #3a3a52" }}>
        {Object.keys(tabs).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            background: activeTab === t ? "#3a3a56" : "transparent",
            border: "none", color: activeTab === t ? "#fff" : "#9898b0",
            padding: "4px 14px", fontSize: 12, cursor: "pointer", borderRadius: 2,
            fontWeight: activeTab === t ? 600 : 400, transition: "all 0.15s",
          }}>{t}</button>
        ))}
      </div>
      {/* Toolbar */}
      <div style={{ height: 38, background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", flexShrink: 0, borderBottom: "1px solid #e0e0e8", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div style={{ background: "#0078D4", color: "#fff", padding: "4px 12px", borderRadius: 3, fontSize: 11, fontWeight: 800, letterSpacing: "0.06em", marginRight: 10 }}>
            {activeTab.toUpperCase()}
          </div>
          {["New", "Browse", "Publish"].map((l) => (
            <button key={l} onClick={() => {
              if (l === "New") { project.newProject(); setActiveTab("File"); }
            }} style={{ background: "transparent", border: "none", color: "#444", padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 500 }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AIToggle enabled={aiEnabled} onChange={setAiEnabled} />
          <button onClick={() => setActiveTab("File")} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 14, color: "#888", padding: "2px 6px" }}>⚙</button>
        </div>
      </div>
      {/* Tab Content */}
      <div style={{ flex: 1, padding: 12, overflow: "hidden", background: "#eceef2" }}>
        {tabs[activeTab]}
      </div>
    </div>
  );
}
