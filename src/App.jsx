import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import DashboardTab from "./tabs/DashboardTab";
import DataTab from "./tabs/DataTab";
import ChartTab from "./tabs/ChartTab";
import SpreadsheetTab from "./tabs/SpreadsheetTab";
import FileTab from "./tabs/FileTab";
import FleetTableTab from "./tabs/FleetTableTab";
import PipelineTab from "./tabs/PipelineTab";
import { generateFleet, tickFleet } from "./data/fleet";

// ── SVG Logo ──
const R64Logo = () => (
  <svg width="70" height="16" viewBox="0 0 70 16">
    <text x="0" y="13" fill="#0078D4" fontFamily="'Segoe UI',system-ui" fontSize="13" fontWeight="900" letterSpacing="-0.5">Row64</text>
  </svg>
);

// ── AI Toggle ──
function AIToggle({ enabled, onChange }) {
  return (
    <button onClick={() => onChange(!enabled)} title={enabled ? "AI ON" : "AI OFF"}
      style={{ display: "flex", alignItems: "center", gap: 5, background: enabled ? "#dcfce7" : "#f1f5f9",
        border: `1px solid ${enabled ? "#86efac" : "#e2e8f0"}`, borderRadius: 14, padding: "3px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600,
        color: enabled ? "#16a34a" : "#94a3b8", transition: "all 0.2s" }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: enabled ? "#22c55e" : "#cbd5e1" }} />
      AI
    </button>
  );
}

// ── Navigation structure ──
const NAV = [
  {
    id: "fleet", label: "Fleet Demo", icon: "🚛",
    children: [
      { id: "fleet-dashboard", label: "Dashboard" },
      { id: "fleet-map", label: "Fleet Table" },
      { id: "fleet-data", label: "Data" },
      { id: "fleet-chart", label: "Chart" },
      { id: "fleet-spreadsheet", label: "Spreadsheet" },
    ],
  },
  {
    id: "pipeline", label: "Sales Pipeline Demo", icon: "📊",
    children: [
      { id: "pipeline-overview", label: "Pipeline Overview" },
    ],
  },
  {
    id: "files", label: "File Manager", icon: "📁",
    children: [
      { id: "file-browser", label: "Browse" },
    ],
  },
];

export default function App() {
  const queryClient = useQueryClient();
  const [fleet, setFleet] = useState(() => generateFleet(24));
  const [aiEnabled, setAiEnabled] = useState(false);
  const [activeId, setActiveId] = useState("fleet-dashboard");
  const [expandedCats, setExpandedCats] = useState(["fleet", "pipeline"]);
  const [search, setSearch] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Fleet animation
  useEffect(() => {
    const iv = setInterval(() => {
      setFleet((prev) => {
        const next = tickFleet(prev);
        queryClient.setQueryData(["fleet"], next);
        return next;
      });
    }, 2000);
    return () => clearInterval(iv);
  }, [queryClient]);

  const toggleCat = useCallback((catId) => {
    setExpandedCats(prev => prev.includes(catId) ? prev.filter(x => x !== catId) : [...prev, catId]);
  }, []);

  // Filter nav by search
  const filteredNav = useMemo(() => {
    if (!search.trim()) return NAV;
    const q = search.toLowerCase();
    return NAV.map(cat => ({
      ...cat,
      children: cat.children.filter(c => c.label.toLowerCase().includes(q) || cat.label.toLowerCase().includes(q)),
    })).filter(cat => cat.children.length > 0);
  }, [search]);

  // Resolve active tab to component
  const tabContent = useMemo(() => {
    const map = {
      "fleet-dashboard": <DashboardTab fleet={fleet} aiEnabled={aiEnabled} />,
      "fleet-map": <FleetTableTab />,
      "fleet-data": <DataTab />,
      "fleet-chart": <ChartTab />,
      "fleet-spreadsheet": <SpreadsheetTab />,
      "pipeline-overview": <PipelineTab />,
      "file-browser": <FileTab />,
    };
    return map[activeId] || <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8" }}>Select a view</div>;
  }, [activeId, fleet, aiEnabled]);

  // Find breadcrumb
  const breadcrumb = useMemo(() => {
    for (const cat of NAV) {
      const child = cat.children.find(c => c.id === activeId);
      if (child) return `${cat.label} › ${child.label}`;
    }
    return "";
  }, [activeId]);

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column",
      fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif", overflow: "hidden", background: "#f0f2f5", color: "#1e293b" }}>

      {/* ── Title Bar ── */}
      <div style={{ height: 32, background: "#1e1e2e", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 12px", color: "#a0a0b8", fontSize: 12, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <R64Logo />
          <span style={{ fontSize: 11, color: "#8888a0" }}>Row64 Studio</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ padding: "2px 10px", background: "#10b981", borderRadius: 3, color: "#fff", fontSize: 10, fontWeight: 700 }}>localhost</div>
        </div>
      </div>

      {/* ── Main Layout: Sidebar + Content ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: sidebarCollapsed ? 48 : 220, background: "#fff", borderRight: "1px solid #e2e8f0",
          display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.2s" }}>
          {/* Sidebar header */}
          <div style={{ padding: sidebarCollapsed ? "10px 8px" : "12px 14px", borderBottom: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {!sidebarCollapsed && <span style={{ fontSize: 12, fontWeight: 800, color: "#0078D4", letterSpacing: "0.02em" }}>DEMO ASSETS</span>}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#94a3b8", padding: "2px 4px" }}>
              {sidebarCollapsed ? "▸" : "◂"}
            </button>
          </div>
          {/* Search */}
          {!sidebarCollapsed && (
            <div style={{ padding: "8px 14px" }}>
              <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 6,
                  fontSize: 11, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
            </div>
          )}
          {/* Nav items */}
          <div style={{ flex: 1, overflow: "auto", padding: "4px 0" }}>
            {filteredNav.map(cat => (
              <div key={cat.id}>
                <button onClick={() => toggleCat(cat.id)}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: sidebarCollapsed ? "8px 12px" : "8px 14px",
                    background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#334155",
                    textAlign: "left" }}>
                  <span style={{ fontSize: 14 }}>{cat.icon}</span>
                  {!sidebarCollapsed && (
                    <>
                      <span style={{ flex: 1 }}>{cat.label}</span>
                      <span style={{ fontSize: 10, color: "#94a3b8", transform: expandedCats.includes(cat.id) ? "rotate(90deg)" : "none",
                        transition: "transform 0.15s" }}>▸</span>
                    </>
                  )}
                </button>
                {!sidebarCollapsed && expandedCats.includes(cat.id) && cat.children.map(child => (
                  <button key={child.id} onClick={() => setActiveId(child.id)}
                    style={{ width: "100%", display: "block", padding: "6px 14px 6px 38px", background: activeId === child.id ? "#eff6ff" : "none",
                      border: "none", cursor: "pointer", fontSize: 12, color: activeId === child.id ? "#0078D4" : "#64748b",
                      fontWeight: activeId === child.id ? 600 : 400, textAlign: "left", borderLeft: activeId === child.id ? "3px solid #0078D4" : "3px solid transparent",
                      transition: "all 0.1s" }}>
                    {child.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Toolbar */}
          <div style={{ height: 38, background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 14px", flexShrink: 0, borderBottom: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: "#0078D4", color: "#fff", padding: "3px 12px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                Row64 Studio
              </div>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{breadcrumb}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AIToggle enabled={aiEnabled} onChange={setAiEnabled} />
            </div>
          </div>
          {/* Tab content */}
          <div style={{ flex: 1, overflow: "hidden", background: "#eceef2" }}>
            {tabContent}
          </div>
        </div>
      </div>
    </div>
  );
}
