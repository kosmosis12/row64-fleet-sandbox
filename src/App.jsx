import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { generateFleet, ROUTES, interpolateRoute } from "./data/fleet";
import { generateWaterData } from "./data/water";
import { useProjectState } from "./hooks/useProjectState";
import DashboardTab from "./tabs/DashboardTab";
import DataTab from "./tabs/DataTab";
import ChartTab from "./tabs/ChartTab";
import SpreadsheetTab from "./tabs/SpreadsheetTab";
import FleetTableTab from "./tabs/FleetTableTab";
import FileTab from "./tabs/FileTab";
import ChartBuilder from "./components/chart-builder/ChartBuilder";
import WaterDashboardTab from "./tabs/WaterDashboardTab";
import WaterTableTab from "./tabs/WaterTableTab";
import WaterChartBuilder from "./components/water-chart-builder/WaterChartBuilder";

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
  const [sidebarSections, setSidebarSections] = useState({ fleet: true, water: true });
  const [dataMenuOpen, setDataMenuOpen] = useState(false);
  const dataMenuRef = useRef(null);

  // Close the Data dropdown on outside click
  useEffect(() => {
    if (!dataMenuOpen) return;
    const onDocClick = (e) => {
      if (dataMenuRef.current && !dataMenuRef.current.contains(e.target)) {
        setDataMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [dataMenuOpen]);

  // Seed the water work order dataset into the react-query cache so
  // WaterDashboardTab / WaterTableTab / WaterChartBuilder can all read it.
  useEffect(() => {
    if (!queryClient.getQueryData(["r64", "water", "workorders"])) {
      queryClient.setQueryData(["r64", "water", "workorders"], generateWaterData());
    }
  }, [queryClient]);

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
    "Chart Builder": <ChartBuilder onMarkDirty={project.markDirty} />,
    Spreadsheet: <SpreadsheetTab onMarkDirty={project.markDirty} />,
    "Fleet Table": <FleetTableTab fleet={fleet} />,
    Dashboard: <DashboardTab fleet={fleet} tick={tick} aiEnabled={aiEnabled} />,
    "Water Dashboard": <WaterDashboardTab />,
    "Water Orders": <WaterTableTab />,
    "Water Chart Builder": <WaterChartBuilder onMarkDirty={project.markDirty} />,
  };

  const demoSections = [
    {
      key: "fleet",
      label: "Fleet Demo",
      accent: "#0078D4",
      items: [
        { tab: "Dashboard", label: "Dashboard" },
        { tab: "Fleet Table", label: "Fleet Table" },
        { tab: "Data", label: "Data" },
        { tab: "Chart", label: "Chart" },
        { tab: "Chart Builder", label: "Chart Builder" },
        { tab: "Spreadsheet", label: "Spreadsheet" },
      ],
    },
    {
      key: "water",
      label: "Water Utilities",
      accent: "#06b6d4",
      items: [
        { tab: "Water Dashboard", label: "Dashboard" },
        { tab: "Water Orders", label: "Work Orders" },
        { tab: "Water Chart Builder", label: "Chart Builder" },
      ],
    },
  ];

  const toggleSection = (k) =>
    setSidebarSections((prev) => ({ ...prev, [k]: !prev[k] }));

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
        {["File", "Data", "Spreadsheet"].map((t) => {
          if (t === "Data") {
            const dataSubTabs = [
              { tab: "Data", label: "Data View" },
              { tab: "Chart", label: "Chart" },
              { tab: "Chart Builder", label: "Chart Builder" },
            ];
            const isDataActive = dataSubTabs.some((s) => s.tab === activeTab);
            return (
              <div key={t} ref={dataMenuRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setDataMenuOpen((o) => !o)}
                  style={{
                    background: isDataActive || dataMenuOpen ? "#3a3a56" : "transparent",
                    border: "none",
                    color: isDataActive ? "#fff" : "#9898b0",
                    padding: "4px 14px",
                    fontSize: 12,
                    cursor: "pointer",
                    borderRadius: 2,
                    fontWeight: isDataActive ? 600 : 400,
                    transition: "all 0.15s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Data
                  <span style={{ fontSize: 9, opacity: 0.8 }}>▾</span>
                </button>
                {dataMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: 2,
                      minWidth: 148,
                      background: "#2a2a3e",
                      border: "1px solid #3a3a52",
                      borderRadius: 3,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
                      padding: "4px 0",
                      zIndex: 100,
                    }}
                  >
                    {dataSubTabs.map((sub) => {
                      const subActive = activeTab === sub.tab;
                      return (
                        <div
                          key={sub.tab}
                          onClick={() => {
                            setActiveTab(sub.tab);
                            setDataMenuOpen(false);
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#3a3a56";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                          style={{
                            padding: "6px 14px",
                            fontSize: 12,
                            color: subActive ? "#fff" : "#9898b0",
                            cursor: "pointer",
                            fontWeight: subActive ? 600 : 400,
                            userSelect: "none",
                            transition: "background 0.15s",
                          }}
                        >
                          {sub.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          const active = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                background: active ? "#3a3a56" : "transparent",
                border: "none",
                color: active ? "#fff" : "#9898b0",
                padding: "4px 14px",
                fontSize: 12,
                cursor: "pointer",
                borderRadius: 2,
                fontWeight: active ? 600 : 400,
                transition: "all 0.15s",
              }}
            >
              {t}
            </button>
          );
        })}
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
      {/* Sidebar + Tab Content */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, background: "#eceef2" }}>
        {/* Demo Assets sidebar */}
        <div
          style={{
            width: 188,
            flexShrink: 0,
            background: "#ffffff",
            borderRight: "1px solid #e0e0e8",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              padding: "10px 12px 6px",
              fontSize: 9,
              fontWeight: 800,
              color: "#888",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Demo Assets
          </div>
          {demoSections.map((section) => {
            const expanded = sidebarSections[section.key];
            const activeInSection = section.items.some((it) => it.tab === activeTab);
            return (
              <div key={section.key} style={{ marginBottom: 4 }}>
                <div
                  onClick={() => toggleSection(section.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 700,
                    color: activeInSection ? "#1a1a2e" : "#444",
                    background: activeInSection ? "#f1f5fb" : "transparent",
                    borderLeft: `3px solid ${activeInSection ? section.accent : "transparent"}`,
                    userSelect: "none",
                  }}
                >
                  <span style={{ fontSize: 9, color: "#888", width: 8 }}>
                    {expanded ? "▾" : "▸"}
                  </span>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: section.accent,
                    }}
                  />
                  {section.label}
                </div>
                {expanded &&
                  section.items.map((item) => {
                    const active = activeTab === item.tab;
                    return (
                      <div
                        key={item.tab}
                        onClick={() => setActiveTab(item.tab)}
                        style={{
                          padding: "5px 12px 5px 34px",
                          fontSize: 11,
                          color: active ? "#0078D4" : "#555",
                          background: active ? "#e8f1fb" : "transparent",
                          borderLeft: `3px solid ${active ? "#0078D4" : "transparent"}`,
                          cursor: "pointer",
                          fontWeight: active ? 700 : 500,
                        }}
                      >
                        {item.label}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
        {/* Tab Content */}
        <div style={{ flex: 1, padding: 12, overflow: "hidden", minWidth: 0 }}>
          {tabs[activeTab]}
        </div>
      </div>
    </div>
  );
}
