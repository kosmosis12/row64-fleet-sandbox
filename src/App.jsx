import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { generateFleet, ROUTES, interpolateRoute } from "./data/fleet";
import { getModelList } from "./ai/provider";
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
  <div
    onClick={() => onChange(!enabled)}
    style={{
      display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
      padding: "3px 10px", borderRadius: 20,
      background: enabled ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.08)",
      border: `1px solid ${enabled ? "#10b981" : "#d1d5db"}`,
      transition: "all 0.2s ease",
    }}
  >
    <div style={{ position: "relative", width: 28, height: 16 }}>
      <div style={{
        width: 28, height: 16, borderRadius: 8,
        background: enabled ? "#10b981" : "#d1d5db",
        transition: "background 0.2s ease",
      }} />
      <div style={{
        position: "absolute", top: 2, left: enabled ? 14 : 2,
        width: 12, height: 12, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transition: "left 0.2s ease",
      }} />
    </div>
    <span style={{
      fontSize: 10, fontWeight: 600, letterSpacing: "0.04em",
      color: enabled ? "#10b981" : "#9ca3af",
      transition: "color 0.2s ease", userSelect: "none",
    }}>
      AI {enabled ? "ON" : "OFF"}
    </span>
  </div>
);

const AISettings = ({ activeModel, onModelChange, onClose }) => {
  const models = getModelList();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{
      position: "absolute", top: 38, right: 0, zIndex: 2000,
      background: "#fff", border: "1px solid #e0e0e8", borderRadius: 8,
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: "10px 0",
      minWidth: 220,
    }}>
      <div style={{ padding: "4px 14px 8px", fontSize: 9, fontWeight: 700, color: "#999", letterSpacing: "0.1em" }}>
        AI MODEL
      </div>
      {models.map((m) => {
        const isActive = activeModel === m.id;
        return (
          <div
            key={m.id}
            onClick={() => { onModelChange(m.id); onClose(); }}
            style={{
              padding: "6px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              background: isActive ? "#f8faf9" : "transparent",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f8f9fc"; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{
              width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
              background: isActive ? "#10b981" : "transparent",
              border: isActive ? "none" : "1px solid #ddd",
              transition: "all 0.15s",
            }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 400, color: "#1a1a2e" }}>{m.label}</div>
              <div style={{ fontSize: 9, color: "#aaa", fontFamily: "monospace", fontWeight: 400 }}>{m.id}</div>
            </div>
          </div>
        );
      })}
      <div style={{ borderTop: "1px solid #f0f0f0", margin: "6px 0 0", padding: "8px 14px 4px" }}>
        <div style={{ fontSize: 8, color: "#ccc" }}>Routed via Tailscale Aperture</div>
      </div>
    </div>
  );
};

export default function App() {
  const queryClient = useQueryClient();
  const [fleet, setFleet] = useState(generateFleet);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [tick, setTick] = useState(0);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiModel, setAiModel] = useState("gemini-3.1-flash-lite-preview");
  const [showAISettings, setShowAISettings] = useState(false);

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
    File: <FileTab />,
    Data: <DataTab />,
    Chart: <ChartTab />,
    Spreadsheet: <SpreadsheetTab />,
    "Fleet Table": <FleetTableTab fleet={fleet} />,
    Dashboard: <DashboardTab fleet={fleet} tick={tick} aiEnabled={aiEnabled} aiModel={aiModel} />,
  };

  return (
    <div style={{ width:"100vw", height:"100vh", display:"flex", flexDirection:"column", background:"#f0f2f5", fontFamily:"'Segoe UI',-apple-system,sans-serif", overflow:"hidden", color:"#1a1a2e" }}>
      <div style={{ height:32, background:"#1e1e2e", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 10px", fontSize:12, flexShrink:0 }}>
        <R64Logo />
        <span style={{ color:"#8888a0" }}>Row64 - Fleet Management Sandbox v5 (TanStack)</span>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <div style={{ padding:"2px 10px", background:"#10b981", borderRadius:3, color:"#fff", fontSize:10, fontWeight:700 }}>localhost</div>
          <span style={{ color:"#555", marginLeft:8 }}>⌄</span>
          <span style={{ color:"#555" }}>∧</span>
          <span style={{ color:"#555" }}>✕</span>
        </div>
      </div>
      <div style={{ height:30, background:"#2a2a3e", display:"flex", alignItems:"center", padding:"0 8px", flexShrink:0, borderBottom:"1px solid #3a3a52" }}>
        {Object.keys(tabs).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            background: activeTab === t ? "#3a3a56" : "transparent",
            border:"none", color: activeTab === t ? "#fff" : "#9898b0",
            padding:"4px 14px", fontSize:12, cursor:"pointer", borderRadius:2,
            fontWeight: activeTab === t ? 600 : 400,
          }}>{t}</button>
        ))}
      </div>
      <div style={{ height:38, background:"#fff", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 10px", flexShrink:0, borderBottom:"1px solid #e0e0e8", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:2 }}>
          <div style={{ background:"#0078D4", color:"#fff", padding:"4px 12px", borderRadius:3, fontSize:11, fontWeight:800, letterSpacing:"0.06em", marginRight:10 }}>
            {activeTab.toUpperCase()}
          </div>
          {["New","Browse","Publish"].map((l) => (
            <button key={l} style={{ background:"transparent", border:"none", color:"#444", padding:"4px 10px", fontSize:11, cursor:"pointer", fontWeight:500 }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
          <AIToggle enabled={aiEnabled} onChange={setAiEnabled} />
          <button
            onClick={() => setShowAISettings(!showAISettings)}
            style={{
              width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
              background: showAISettings ? "#e8f0fe" : "transparent",
              border: "1px solid #e0e0e8", borderRadius: 6, cursor: "pointer",
              color: "#666", fontSize: 14, transition: "all 0.15s",
            }}
            title="AI Settings"
          >
            ⚙
          </button>
          {showAISettings && (
            <AISettings
              activeModel={aiModel}
              onModelChange={setAiModel}
              onClose={() => setShowAISettings(false)}
            />
          )}
        </div>
      </div>
      <div style={{ flex:1, padding:12, overflow:"hidden", background:"#eceef2" }}>
        {tabs[activeTab]}
      </div>
    </div>
  );
}
