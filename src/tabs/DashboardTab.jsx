import { useState } from "react";
import RouteProgressBars from "../components/RouteProgressBars";
import FleetMap from "../components/FleetMap";
import TruckPopup from "../components/TruckPopup";
import AIPanel from "../components/AIPanel";
import RightPanel from "../components/RightPanel";
import { FLEET_SIZE, ROUTES } from "../data/fleet";

export default function DashboardTab({ fleet, tick, aiProvider, aiApiKey, aiModel }) {
  const [selected, setSelected] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const handleSelect = (v) => { setSelected(v); setShowAI(false); };
  // keep selected in sync
  const sel = selected ? fleet.find(v=>v.id===selected.id) || null : null;

  return <div style={{width:"100%",height:"100%",background:"#fff",borderRadius:4,border:"2px dashed #0078D4",display:"flex",flexDirection:"column",gap:8,padding:12,overflow:"hidden"}}>
    <style>{`@keyframes pulse{0%,100%{transform:scale(1);opacity:0.15}50%{transform:scale(1.4);opacity:0.08}}`}</style>
    <RouteProgressBars fleet={fleet}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:10,flex:1,minHeight:0}}>
      <div style={{borderRadius:6,overflow:"hidden",border:"1px solid #e0e0e8",position:"relative",minHeight:300}}>
        <div style={{position:"absolute",top:10,right:50,display:"flex",gap:8,zIndex:1000,background:"rgba(255,255,255,0.92)",padding:"5px 10px",borderRadius:4,border:"1px solid #e0e0e8",boxShadow:"0 1px 4px rgba(0,0,0,0.08)"}}>
          {[["Transit","#10b981"],["Delayed","#ef4444"],["Dock","#f59e0b"],["Maint.","#6b7280"]].map(([l,c])=><div key={l} style={{display:"flex",alignItems:"center",gap:3,fontSize:9,color:"#555"}}><div style={{width:7,height:7,borderRadius:"50%",background:c}}/>{l}</div>)}
        </div>
        <div style={{position:"absolute",bottom:10,left:10,fontSize:9,color:"#999",fontFamily:"monospace",zIndex:1000,background:"rgba(255,255,255,0.85)",padding:"2px 8px",borderRadius:3}}>{FLEET_SIZE} vehicles · {ROUTES.length} routes · tick {tick}</div>
        {sel && !showAI && <TruckPopup vehicle={sel} onClose={()=>setSelected(null)} onShowAI={()=>setShowAI(true)}/>}
        {sel && showAI && <AIPanel vehicle={sel} onClose={()=>{setShowAI(false);setSelected(null);}} onBack={()=>setShowAI(false)} aiProvider={aiProvider} aiApiKey={aiApiKey} aiModel={aiModel}/>}
        <FleetMap fleet={fleet} selected={sel} onSelect={handleSelect}/>
      </div>
      <RightPanel fleet={fleet}/>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0 0",borderTop:"1px solid #eee",flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <div style={{background:"#f0f2f8",border:"1px solid #dde",borderRadius:3,padding:"3px 8px",fontSize:10,color:"#666"}}>Dash1</div>
        <div style={{width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f2f8",border:"1px solid #dde",borderRadius:3,cursor:"pointer",color:"#0078D4",fontSize:14,fontWeight:700}}>+</div>
      </div>
      <div style={{fontSize:10,color:"#aaa",display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:"50%",background:"#10b981"}}/>Ready</div>
    </div>
  </div>;
}
