import { useState, useCallback } from "react";
import Icon from "../components/Icon";

const CONNECTORS = [
  { id: "postgres", name: "PostgreSQL", logo: "/logos/postgresql.png", category: "database", fields: ["host", "port", "database", "user", "password"] },
  { id: "snowflake", name: "Snowflake", logo: "/logos/snowflake.png", category: "warehouse", fields: ["account", "warehouse", "database", "schema", "user", "password"] },
  { id: "bigquery", name: "BigQuery", logo: "/logos/bigquery.png", category: "warehouse", fields: ["project_id", "dataset", "credentials_json"] },
  { id: "clickhouse", name: "ClickHouse", logo: "/logos/clickhouse.png", category: "database", fields: ["host", "port", "database", "user", "password"] },
  { id: "csv", name: "CSV / TSV", logo: "/logos/csv.png", category: "file", fields: [] },
  { id: "parquet", name: "Parquet", logo: "/logos/parquet.png", category: "file", fields: [] },
  { id: "json", name: "JSON / NDJSON", logo: "/logos/json.png", category: "file", fields: [] },
  { id: "kafka", name: "Kafka Stream", logo: "/logos/kafka.png", category: "stream", fields: ["bootstrap_servers", "topic", "group_id"] },
  { id: "r64server", name: "Row64 Server", logo: "/logos/row64.png", category: "compute", fields: ["host", "port"] },
  { id: "supabase", name: "Supabase", logo: "/logos/supabase.png", category: "database", fields: ["url", "anon_key", "table"] },
];

const SERVER_DATASETS = [
  { name: "fleet_telemetry", rows: "587K", size: "142 MB", format: ".ramdb", status: "live" },
  { name: "fleet_routes", rows: "50K", size: "12 MB", format: ".ramdb", status: "live" },
  { name: "fleet_maintenance", rows: "10K", size: "3.2 MB", format: ".ramdb", status: "live" },
  { name: "fleet_incidents", rows: "2K", size: "0.8 MB", format: ".ramdb", status: "live" },
  { name: "fleet_fuel", rows: "25K", size: "6.1 MB", format: ".ramdb", status: "live" },
];

const ConnectorIcon = ({ connector, size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: 8, overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: "#fff", border: "1px solid #eee", flexShrink: 0,
  }}>
    <img
      src={connector.logo}
      alt={connector.name}
      style={{ width: size - 4, height: size - 4, objectFit: "contain" }}
      onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.textContent = connector.name[0]; }}
    />
  </div>
);

export default function DataTab({ onMarkDirty }) {
  const [activeSection, setActiveSection] = useState(null);
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [connectorValues, setConnectorValues] = useState({});
  const [connections, setConnections] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [testStatus, setTestStatus] = useState(null);

  const handleFileUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles((prev) => [...prev, ...files.map((f) => ({ name: f.name, size: f.size, type: f.type, addedAt: new Date().toISOString() }))]);
    if (onMarkDirty) onMarkDirty();
  }, [onMarkDirty]);

  const handleTestConnection = useCallback(() => {
    setTestStatus("testing");
    setTimeout(() => {
      setTestStatus(Math.random() > 0.3 ? "success" : "failed");
      setTimeout(() => setTestStatus(null), 3000);
    }, 1200);
  }, []);

  const handleConnect = useCallback(() => {
    if (selectedConnector) {
      setConnections((prev) => [...prev, { ...selectedConnector, connectedAt: new Date().toISOString(), values: { ...connectorValues } }]);
      setSelectedConnector(null);
      setConnectorValues({});
      if (onMarkDirty) onMarkDirty();
    }
  }, [selectedConnector, connectorValues, onMarkDirty]);

  const menuItems = [
    { icon: "/icons/database.png", label: "Get Data", desc: "Connect to external data sources", section: "connectors" },
    { icon: "/icons/database-view.png", label: "Server Data", desc: "Browse Row64 Server datasets", section: "server" },
    { icon: "/icons/import.png", label: "Import Data", desc: "Import CSV, JSON, Parquet files", section: "import" },
    { icon: "/icons/cloud-folder.png", label: "Upload File Assets", desc: "Upload images, documents, media", section: "upload" },
  ];

  const S = {
    wrap: { width: "100%", height: "100%", background: "#fff", borderRadius: 4, border: "2px dashed #0078D4", display: "flex", overflow: "hidden" },
    sidebar: { width: 240, background: "#f8f9fc", borderRight: "1px solid #e8eaef", padding: 8, display: "flex", flexDirection: "column", gap: 2 },
    badge: { background: "#0078D4", color: "#fff", padding: "4px 10px", borderRadius: 3, fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", marginBottom: 12, display: "inline-block" },
    main: { flex: 1, padding: 16, overflowY: "auto" },
  };

  const renderConnectors = () => (
    <div>
      <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#333" }}>Data Connectors</h3>
      {connections.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#666", marginBottom: 6 }}>ACTIVE CONNECTIONS</div>
          {connections.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, marginBottom: 4, fontSize: 12 }}>
              <ConnectorIcon connector={c} size={22} />
              <span style={{ fontWeight: 600 }}>{c.name}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#10b981" }}>● Connected</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {CONNECTORS.map((c) => (
          <div key={c.id} onClick={() => { setSelectedConnector(c); setConnectorValues({}); setTestStatus(null); }}
            style={{
              padding: "14px 14px", border: selectedConnector?.id === c.id ? "2px solid #0078D4" : "1px solid #eee",
              borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
              background: selectedConnector?.id === c.id ? "#f0f7ff" : "#fff",
              display: "flex", alignItems: "center", gap: 12,
            }}
            onMouseEnter={(e) => { if (selectedConnector?.id !== c.id) { e.currentTarget.style.borderColor = "#ccc"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)"; } }}
            onMouseLeave={(e) => { if (selectedConnector?.id !== c.id) { e.currentTarget.style.borderColor = "#eee"; e.currentTarget.style.boxShadow = "none"; } }}>
            <ConnectorIcon connector={c} size={36} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>{c.name}</div>
              <div style={{ fontSize: 10, color: "#999", textTransform: "capitalize" }}>{c.category}</div>
            </div>
          </div>
        ))}
      </div>
      {selectedConnector && selectedConnector.fields.length > 0 && (
        <div style={{ marginTop: 16, padding: 16, background: "#fafbfd", border: "1px solid #e8eaef", borderRadius: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <ConnectorIcon connector={selectedConnector} size={28} />
            <div style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>Connect to {selectedConnector.name}</div>
          </div>
          {selectedConnector.fields.map((field) => (
            <div key={field} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#666", display: "block", marginBottom: 3, textTransform: "capitalize" }}>{field.replace(/_/g, " ")}</label>
              <input
                type={field.includes("password") || field.includes("key") || field.includes("credentials") ? "password" : "text"}
                value={connectorValues[field] || ""}
                onChange={(e) => setConnectorValues((prev) => ({ ...prev, [field]: e.target.value }))}
                placeholder={field === "host" ? "localhost" : field === "port" ? "5432" : ""}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #ddd", borderRadius: 4, fontSize: 12, fontFamily: "monospace", boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={handleTestConnection}
              style={{ padding: "7px 16px", border: "1px solid #ddd", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer", background: testStatus === "success" ? "#d1fae5" : testStatus === "failed" ? "#fef2f2" : "#fff", color: testStatus === "success" ? "#065f46" : testStatus === "failed" ? "#991b1b" : "#333", transition: "all 0.2s" }}>
              {testStatus === "testing" ? "Testing..." : testStatus === "success" ? "✓ Connected" : testStatus === "failed" ? "✗ Failed" : "Test Connection"}
            </button>
            <button onClick={handleConnect}
              style={{ padding: "7px 16px", background: "#0078D4", color: "#fff", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
              Connect
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderServer = () => (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <img src="/logos/row64.png" alt="Row64" style={{ height: 22, objectFit: "contain" }} />
        <h3 style={{ margin: 0, fontSize: 14, color: "#333" }}>Row64 Server — RamDB Datasets</h3>
      </div>
      <div style={{ fontSize: 11, color: "#888", marginBottom: 16 }}>localhost:9002 · GPU Compute ON · 24 threads</div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #e8eaef" }}>
            {["Dataset", "Rows", "Size", "Format", "Status", ""].map((h) => (
              <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.04em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SERVER_DATASETS.map((ds) => (
            <tr key={ds.name} style={{ borderBottom: "1px solid #f0f0f5" }}>
              <td style={{ padding: "10px", fontWeight: 600, fontFamily: "monospace", color: "#333" }}>{ds.name}</td>
              <td style={{ padding: "10px", color: "#666" }}>{ds.rows}</td>
              <td style={{ padding: "10px", color: "#666" }}>{ds.size}</td>
              <td style={{ padding: "10px" }}><span style={{ background: "#eef0f5", padding: "2px 8px", borderRadius: 3, fontSize: 10, fontWeight: 600 }}>{ds.format}</span></td>
              <td style={{ padding: "10px" }}><span style={{ color: "#10b981", fontWeight: 600, fontSize: 11 }}>● {ds.status}</span></td>
              <td style={{ padding: "10px" }}>
                <button style={{ background: "#0078D4", color: "#fff", border: "none", padding: "4px 12px", borderRadius: 3, fontSize: 10, fontWeight: 600, cursor: "pointer" }}>Load</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderImport = () => (
    <div>
      <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#333" }}>Import Data</h3>
      <div
        onClick={() => document.getElementById("r64-file-import").click()}
        style={{ border: "2px dashed #ccc", borderRadius: 8, padding: 40, textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#0078D4"}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#ccc"}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#0078D4"; }}
        onDragLeave={(e) => e.currentTarget.style.borderColor = "#ccc"}
        onDrop={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#ccc"; handleFileUpload({ target: { files: e.dataTransfer.files } }); }}>
        <Icon src="/icons/import.png" size={40} />
        <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginTop: 8 }}>Drop files here or click to browse</div>
        <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>CSV, TSV, JSON, NDJSON, Parquet, Excel</div>
      </div>
      <input id="r64-file-import" type="file" multiple accept=".csv,.tsv,.json,.ndjson,.parquet,.xlsx,.xls" style={{ display: "none" }} onChange={handleFileUpload} />
      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#666", marginBottom: 6 }}>IMPORTED FILES</div>
          {uploadedFiles.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "#fafbfd", border: "1px solid #eee", borderRadius: 4, marginBottom: 4, fontSize: 12 }}>
              <span>📄</span>
              <span style={{ fontWeight: 500 }}>{f.name}</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#999" }}>{(f.size / 1024).toFixed(1)} KB</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderUpload = () => (
    <div>
      <h3 style={{ margin: "0 0 12px", fontSize: 14, color: "#333" }}>Upload File Assets</h3>
      <div
        onClick={() => document.getElementById("r64-asset-upload").click()}
        style={{ border: "2px dashed #ccc", borderRadius: 8, padding: 40, textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#0078D4"}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#ccc"}>
        <Icon src="/icons/cloud-folder.png" size={40} />
        <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginTop: 8 }}>Upload images, documents, media</div>
        <div style={{ fontSize: 11, color: "#999", marginTop: 4 }}>PNG, JPG, SVG, PDF, MP4, GIF</div>
      </div>
      <input id="r64-asset-upload" type="file" multiple style={{ display: "none" }} onChange={handleFileUpload} />
    </div>
  );

  const sections = { connectors: renderConnectors, server: renderServer, import: renderImport, upload: renderUpload };

  return (
    <div style={S.wrap}>
      <div style={S.sidebar}>
        <div style={S.badge}>{activeSection ? activeSection.toUpperCase() : "NO DATA SELECTED"}</div>
        {menuItems.map((it) => (
          <div key={it.label} onClick={() => setActiveSection(it.section)}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 6, cursor: "pointer", transition: "background 0.12s", marginBottom: 2, background: activeSection === it.section ? "#eef0f5" : "transparent" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#eef0f5"}
            onMouseLeave={(e) => { if (activeSection !== it.section) e.currentTarget.style.background = "transparent"; }}>
            <Icon src={it.icon} size={22} />
            <div><div style={{ fontSize: 12, fontWeight: 600, color: "#333" }}>{it.label}</div><div style={{ fontSize: 10, color: "#888" }}>{it.desc}</div></div>
          </div>
        ))}
      </div>
      <div style={S.main}>
        {activeSection ? sections[activeSection]() : (
          <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon src="/icons/no-data.png" size={48} />
            <div style={{ color: "#ccc", fontSize: 13 }}>Select a data source to begin</div>
          </div>
        )}
      </div>
    </div>
  );
}
