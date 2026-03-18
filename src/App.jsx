import { useState, useEffect } from "react";
import { generateFleet, ROUTES, interpolateRoute } from "./data/fleet";
import { getProviderList } from "./ai/provider";
import DashboardTab from "./tabs/DashboardTab";
import DataTab from "./tabs/DataTab";
import ChartTab from "./tabs/ChartTab";
import SpreadsheetTab from "./tabs/SpreadsheetTab";
import FileTab from "./tabs/FileTab";

const R64Logo = () => <svg width="28" height="20" viewBox="0 0 28 20"><rect width="28" height="20" rx="3" fill="#0078D4"/><text x="4" y="15" fontFamily="Arial Black,sans-serif" fontSize="13" fontWeight="900" fill="white">64</text></svg>;

export default function App() {
  const [fleet, setFleet] = useState(generateFleet);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [tick, setTick] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  
  // AI settings
  const [aiProvider, setAiProvider] = useState("claude");
  const [aiApiKey, setAiApiKey] = useState("");
  const [aiModel, setAiModel] = useState("claude-sonnet-4-20250514");
  const providers = getProviderList();

  // Animate fleet
  useEffect(() => {
    const iv = setInterval(() => {
      setTick(t => t + 1);
      setFleet(prev => prev.map(v => {
        if (v.speed === 0) return v;
        let np = v.progress + v.speed;
        if (np >= 1) np = 0.05;
        const [nLng, nLat] = interpolateRoute(ROUTES[v.routeIdx], np);
        const heading = Math.atan2(nLng - v.lng, nLat - v.lat) * (180 / Math.PI);
        return { ...v, progress: np, lat: nLat, lng: nLng, heading, waypointIndex: Math.floor(np * 10000) };
      }));
    }, 100);
    return () => clearInterval(iv);
  }, []);

  const tabs = { File:<FileTab/>, Data:<DataTab/>, Chart:<ChartTab/>, Spreadsheet:<SpreadsheetTab/>, Dashboard:<DashboardTab fleet={fleet} tick={tick} aiProvider={aiProvider} aiApiKey={aiApiKey} aiModel={aiModel}/> };

  return <div style={{width:"100vw",height:"100vh",display:"flex",flexDirection:"column",background:"#f0f2f5",fontFamily:"'Segoe UI',-apple-system,sans-serif",overflow:"hidden",color:"#1a1a2e"}}>
    {/* Title Bar */}
    <div style={{height:32,background:"#1e1e2e",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px",fontSize:12,flexShrink:0}}>
      <R64Logo/><span style={{color:"#8888a0"}}>Row64 - Fleet Management Sandbox (demo)</span>
      <div style={{display:"flex",alignItems:"center",gap:4}}>
        <div style={{padding:"2px 10px",background:"#10b981",borderRadius:3,color:"#fff",fontSize:10,fontWeight:700}}>localhost</div>
        <span style={{color:"#555",marginLeft:8}}>⌄</span><span style={{color:"#555"}}>∧</span><span style={{color:"#555"}}>✕</span>
      </div>
    </div>
    {/* Menu Bar */}
    <div style={{height:30,background:"#2a2a3e",display:"flex",alignItems:"center",padding:"0 8px",flexShrink:0,borderBottom:"1px solid #3a3a52"}}>
      {["File","Data","Chart","Spreadsheet","Dashboard"].map(t=>
        <button key={t} onClick={()=>setActiveTab(t)} style={{background:activeTab===t?"#3a3a56":"transparent",border:"none",color:activeTab===t?"#fff":"#9898b0",padding:"4px 14px",fontSize:12,cursor:"pointer",borderRadius:2,fontWeight:activeTab===t?600:400}}>{t}</button>)}
    </div>
    {/* Toolbar */}
    <div style={{height:38,background:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px",flexShrink:0,borderBottom:"1px solid #e0e0e8",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",alignItems:"center",gap:2}}>
        <div style={{background:"#0078D4",color:"#fff",padding:"4px 12px",borderRadius:3,fontSize:11,fontWeight:800,letterSpacing:"0.06em",marginRight:10}}>{activeTab==="Spreadsheet"?"SPREADSHEET":"DASHBOARD"}</div>
        {["New","Browse","Publish"].map(l=><button key={l} style={{background:"transparent",border:"none",color:"#444",padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:500}}>{l}</button>)}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:2}}>
        {["Global Graph","Layout"].map(l=><button key={l} style={{background:"transparent",border:"none",color:"#666",padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:500}}>{l}</button>)}
        <button onClick={()=>setShowSettings(!showSettings)} style={{background:showSettings?"#e8f0fe":"transparent",border:"none",color:"#666",padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:500}}>Settings</button>
        <button style={{background:"transparent",border:"none",color:"#666",padding:"4px 10px",fontSize:11,cursor:"pointer",fontWeight:500}}>Explore</button>
      </div>
    </div>
    {/* Settings Panel */}
    {showSettings && <div style={{background:"#f8f9fc",borderBottom:"1px solid #e0e0e8",padding:"12px 16px",display:"flex",gap:16,alignItems:"center",flexShrink:0,flexWrap:"wrap"}}>
      <div style={{fontSize:10,fontWeight:700,color:"#666",letterSpacing:"0.06em"}}>AI PROVIDER</div>
      <select value={aiProvider} onChange={e=>{setAiProvider(e.target.value);const p=providers.find(x=>x.key===e.target.value);if(p)setAiModel(p.model);}} style={{padding:"4px 8px",fontSize:11,border:"1px solid #ddd",borderRadius:4,background:"#fff"}}>
        {providers.map(p=><option key={p.key} value={p.key}>{p.name}</option>)}
      </select>
      <div style={{fontSize:10,fontWeight:700,color:"#666",letterSpacing:"0.06em"}}>API KEY</div>
      <input type="password" value={aiApiKey} onChange={e=>setAiApiKey(e.target.value)} placeholder={aiProvider==="ollama"?"Not needed for local":"Enter API key"} style={{padding:"4px 8px",fontSize:11,border:"1px solid #ddd",borderRadius:4,width:220,background:"#fff"}}/>
      <div style={{fontSize:10,fontWeight:700,color:"#666",letterSpacing:"0.06em"}}>MODEL</div>
      <input value={aiModel} onChange={e=>setAiModel(e.target.value)} style={{padding:"4px 8px",fontSize:11,border:"1px solid #ddd",borderRadius:4,width:180,background:"#fff"}}/>
      <div style={{fontSize:9,color:aiApiKey||aiProvider==="ollama"?"#10b981":"#f59e0b",fontWeight:600}}>{aiApiKey||aiProvider==="ollama"?"● Connected":"○ Key required"}</div>
    </div>}
    {/* Tab Content */}
    <div style={{flex:1,padding:12,overflow:"hidden",background:"#eceef2"}}>{tabs[activeTab]}</div>
  </div>;
}
