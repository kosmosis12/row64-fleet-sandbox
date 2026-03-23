import { useState } from "react";
import { queryAI } from "../ai/provider";

export default function AIPanel({ vehicle, onClose, onBack, aiEnabled, aiModel }) {
  if (!vehicle || !vehicle.incident) return null;
  const [dispatched, setDispatched] = useState(false);
  const [liveResponse, setLiveResponse] = useState(null);
  const [activeModel, setActiveModel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useLive, setUseLive] = useState(false);

  const fetchLiveAI = async () => {
    setLoading(true); setUseLive(true);
    const prompt = `Fleet incident report for truck ${vehicle.id}:\n- Location: ${vehicle.lat.toFixed(4)}, ${vehicle.lng.toFixed(4)}\n- Route: ${vehicle.route}\n- Incident: ${vehicle.incident.type}\n- Speed: ${vehicle.displaySpeed.toFixed(0)} mph\n- Fuel: ${vehicle.fuel.toFixed(0)}%\n- Driver: ${vehicle.driver}\n- Cargo: ${vehicle.cargo}\n\nProvide an INCIDENT BRIEF and NEXT BEST ACTION with specific nearby facilities, distances, and dispatch recommendations.`;
    const result = await queryAI(prompt, aiModel);
    setActiveModel(result.model);
    setLiveResponse(result.text);
    setLoading(false);
  };

  return <div style={{position:"absolute",top:10,left:10,width:340,zIndex:1002,background:"#fff",borderRadius:8,boxShadow:"0 4px 20px rgba(0,0,0,0.15)",border:"1px solid #e0e0e8",overflow:"hidden",maxHeight:"calc(100% - 20px)",overflowY:"auto"}}>
    <div style={{background:"#0078D4",padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:1}}>
      <span style={{color:"#fff",fontSize:12,fontWeight:700}}>AI Intelligence - {vehicle.id}</span>
      <div style={{display:"flex",gap:4,alignItems:"center"}}>
        {activeModel && <span style={{fontSize:8,color:"rgba(255,255,255,0.7)",textTransform:"uppercase",fontFamily:"monospace"}}>{activeModel}</span>}
        <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:4,color:"#fff",width:26,height:26,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>
    </div>
    {!useLive ? <>
      <div style={{margin:"10px 12px",padding:"12px 14px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:6}}>
        <div style={{fontSize:10,fontWeight:800,color:"#1e40af",letterSpacing:"0.08em",marginBottom:6}}>INCIDENT BRIEF</div>
        <div style={{fontSize:11,color:"#1e3a5f",lineHeight:1.5}}><strong>Location:</strong> Truck {vehicle.id} at {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)} along {vehicle.route}.<br/><strong>Status:</strong> WARNING<br/>{vehicle.incident.brief}</div>
      </div>
      <div style={{margin:"0 12px 10px",padding:"12px 14px",background:"#fefce8",border:"1px solid #fde68a",borderRadius:6}}>
        <div style={{fontSize:10,fontWeight:800,color:"#92400e",letterSpacing:"0.08em",marginBottom:6}}>⚡ NEXT BEST ACTION</div>
        <div style={{fontSize:11,color:"#78350f",lineHeight:1.5}}>{vehicle.incident.action}</div>
      </div>
      {aiEnabled && <div style={{padding:"4px 12px 8px"}}>
        <button onClick={fetchLiveAI} style={{width:"100%",padding:"8px",background:"#f0f2f8",color:"#0078D4",border:"1px solid #d0d5e0",borderRadius:5,fontSize:10,fontWeight:700,cursor:"pointer"}}>🤖 Query Live AI</button>
      </div>}
    </> : <div style={{margin:"10px 12px"}}>
      {loading ? <div style={{padding:20,textAlign:"center",color:"#888",fontSize:11}}>
        <div style={{fontSize:20,marginBottom:8}}>🧠</div>Querying AI via Aperture...
      </div> : <div style={{padding:"12px 14px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:6}}>
        <div style={{fontSize:10,fontWeight:800,color:"#166534",letterSpacing:"0.08em",marginBottom:6}}>AI RESPONSE <span style={{fontWeight:400,fontSize:8,color:"#4ade80",fontFamily:"monospace"}}>{activeModel}</span></div>
        <div style={{fontSize:11,color:"#14532d",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{liveResponse}</div>
      </div>}
    </div>}
    <div style={{padding:"4px 12px 14px",display:"flex",gap:8,position:"sticky",bottom:0,background:"#fff"}}>
      <button onClick={()=>{onBack();setUseLive(false);setLiveResponse(null);setActiveModel(null);}} style={{flex:0.4,padding:"10px",background:"#f0f2f8",color:"#555",border:"1px solid #ddd",borderRadius:5,fontSize:11,fontWeight:600,cursor:"pointer"}}>Back</button>
      <button onClick={()=>setDispatched(true)} style={{flex:0.6,padding:"10px",background:dispatched?"#10b981":"#ef4444",color:"#fff",border:"none",borderRadius:5,fontSize:11,fontWeight:700,cursor:"pointer",transition:"background 0.2s"}}>{dispatched?"✓ Dispatch Confirmed":"Confirm Dispatch"}</button>
    </div>
  </div>;
}
