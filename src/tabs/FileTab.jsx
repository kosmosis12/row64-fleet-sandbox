import { useState } from "react";

export default function FileTab({ project }) {
  const { projectName, isDirty, newProject, saveProject, saveAs,
          openProject, exportDashboard, printDashboard, recentProjects } = project;
  const [showOpen, setShowOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [apiKeys, setApiKeys] = useState({ claude: "", gemini: "", ollama: "http://localhost:11434" });

  const flash = (msg) => { setFeedback(msg); setTimeout(() => setFeedback(null), 2000); };

  const handleAction = (action) => {
    switch (action) {
      case "new":
        if (newProject()) flash("New project created");
        break;
      case "open":
        setShowOpen(true); setShowSettings(false); setShowApiKeys(false);
        break;
      case "save":
        saveProject(); flash(`Saved "${projectName}"`);
        break;
      case "saveAs":
        if (saveAs()) flash("Project saved");
        break;
      case "export":
        exportDashboard(); flash("Dashboard exported");
        break;
      case "print":
        printDashboard();
        break;
      case "settings":
        setShowSettings(true); setShowOpen(false); setShowApiKeys(false);
        break;
      case "apikeys":
        setShowApiKeys(true); setShowOpen(false); setShowSettings(false);
        break;
    }
  };

  const items = [
    { icon: "/icons/new-project.png", label: "New Project", key: "Ctrl+N", action: "new" },
    { icon: "/icons/database-view.png", label: "Open Project", key: "Ctrl+O", action: "open" },
    { icon: "/icons/save.png", label: "Save", key: "Ctrl+S", action: "save" },
    { icon: "/icons/save.png", label: "Save As...", key: "Ctrl+Shift+S", action: "saveAs" },
    { icon: "/icons/export.png", label: "Export Dashboard", key: "", action: "export" },
    { icon: "/icons/new-project.png", label: "Print", key: "Ctrl+P", action: "print" },
    { sep: true },
    { icon: "/icons/settings.png", label: "Project Settings", key: "", action: "settings" },
    { icon: "/icons/database.png", label: "API Keys & Providers", key: "", action: "apikeys" },
  ];

  const S = {
    wrap: { width: "100%", height: "100%", background: "#fff", borderRadius: 4, border: "2px dashed #0078D4", display: "flex", overflow: "hidden" },
    sidebar: { width: 260, background: "#f8f9fc", borderRight: "1px solid #e8eaef", padding: 8, display: "flex", flexDirection: "column" },
    item: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 4, cursor: "pointer", transition: "background 0.12s" },
    sep: { height: 1, background: "#e0e0e8", margin: "6px 12px" },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    center: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 },
    feedback: { position: "fixed", top: 60, right: 20, background: "#10b981", color: "#fff", padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 12px rgba(16,185,129,0.3)" },
  };

  // Right panel content
  const renderRight = () => {
    if (showOpen) return (
      <div style={{ padding: 20, width: "100%" }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#333" }}>Recent Projects</h3>
        {recentProjects.length === 0 ? (
          <div style={{ color: "#aaa", fontSize: 12 }}>No saved projects yet</div>
        ) : (
          recentProjects.map((name) => (
            <div key={name} onClick={() => { openProject(name); setShowOpen(false); flash(`Opened "${name}"`); }}
              style={{ padding: "10px 14px", borderRadius: 6, cursor: "pointer", marginBottom: 4, border: "1px solid #eee", fontSize: 12, fontWeight: 500, color: "#333", transition: "all 0.12s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#eef0f5"; e.currentTarget.style.borderColor = "#0078D4"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#eee"; }}>
              📁 {name}
            </div>
          ))
        )}
      </div>
    );

    if (showSettings) return (
      <div style={{ padding: 20, width: "100%", maxWidth: 400 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#333" }}>Project Settings</h3>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4 }}>Project Name</label>
        <input value={projectName} onChange={(e) => project.setProjectName(e.target.value)}
          style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 12, marginBottom: 16, boxSizing: "border-box" }} />
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4 }}>Environment</label>
        <select style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 12, marginBottom: 16, background: "#fff" }}>
          <option>localhost (Development)</option>
          <option>Row64 Cloud</option>
          <option>Custom Server</option>
        </select>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4 }}>GPU Compute</label>
        <select style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 12, background: "#fff" }}>
          <option>Enabled (dual 3060s)</option>
          <option>CPU Only</option>
          <option>Auto-detect</option>
        </select>
      </div>
    );

    if (showApiKeys) return (
      <div style={{ padding: 20, width: "100%", maxWidth: 400 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 14, color: "#333" }}>API Keys & Providers</h3>
        {[
          { key: "claude", label: "Claude (Anthropic)", placeholder: "sk-ant-..." },
          { key: "gemini", label: "Gemini (Google)", placeholder: "AIza..." },
          { key: "ollama", label: "Ollama (Local)", placeholder: "http://localhost:11434" },
        ].map(({ key, label, placeholder }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: apiKeys[key] ? "#10b981" : "#d1d5db" }} />
              {label}
            </label>
            <input type={key === "ollama" ? "text" : "password"} value={apiKeys[key]}
              onChange={(e) => setApiKeys((prev) => ({ ...prev, [key]: e.target.value }))}
              placeholder={placeholder}
              style={{ width: "100%", padding: "8px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 11, fontFamily: "monospace", boxSizing: "border-box" }} />
          </div>
        ))}
        <button onClick={() => flash("API keys saved")}
          style={{ background: "#0078D4", color: "#fff", border: "none", padding: "8px 20px", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
          Save Keys
        </button>
      </div>
    );

    // Default state — centered branding
    return (
      <div style={S.center}>
        <div style={{ fontSize: 48, opacity: 0.15 }}>64</div>
        <div style={{ color: "#ccc", fontSize: 12 }}>Row64 Fleet Management Sandbox</div>
        <div style={{ color: "#ddd", fontSize: 10 }}>{projectName}{isDirty ? " •" : ""}</div>
      </div>
    );
  };

  return (
    <div style={S.wrap}>
      {feedback && <div style={S.feedback}>{feedback}</div>}
      <div style={S.sidebar}>
        {items.map((it, i) =>
          it.sep ? <div key={i} style={S.sep} /> : (
            <div key={it.label} onClick={() => handleAction(it.action)} style={S.item}
              onMouseEnter={(e) => e.currentTarget.style.background = "#eef0f5"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img src={it.icon} alt={it.label} width={18} height={18} style={{objectFit:"contain"}} />
                <span style={{ fontSize: 12, color: "#333", fontWeight: 500 }}>{it.label}</span>
              </div>
              {it.key && <span style={{ fontSize: 10, color: "#aaa", fontFamily: "monospace" }}>{it.key}</span>}
            </div>
          )
        )}
      </div>
      <div style={S.main}>{renderRight()}</div>
    </div>
  );
}
