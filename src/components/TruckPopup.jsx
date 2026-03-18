export default function TruckPopup({ vehicle, onClose, onShowAI }) {
  if (!vehicle) return null;
  return <div style={{position:"absolute",top:10,left:10,width:320,zIndex:1001,background:"#fff",borderRadius:8,boxShadow:"0 4px 20px rgba(0,0,0,0.15)",border:"1px solid #e0e0e8",overflow:"hidden"}}>
    <div style={{background:"#0078D4",padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <span style={{color:"#fff",fontSize:12,fontWeight:700,fontFamily:"monospace"}}>Truck: {vehicle.id}</span>
      <div style={{display:"flex",gap:4}}>
        {["🔍","🔧","📍","🎥",vehicle.hasIncident?"🧠":null].filter(Boolean).map((icon,i)=>
          <button key={i} onClick={i===4?onShowAI:undefined} style={{width:26,height:26,borderRadius:4,border:"1px solid rgba(255,255,255,0.3)",background:i===4?"#f59e0b":"rgba(255,255,255,0.15)",color:"#fff",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} title={i===4?"AI Intelligence Brief":""}>{icon}</button>
        )}
        <button onClick={onClose} style={{width:26,height:26,borderRadius:4,border:"1px solid rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.15)",color:"#fff",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
      </div>
    </div>
    {vehicle.hasIncident && vehicle.incident && <div style={{margin:"10px 12px",padding:"10px 14px",border:"2px solid #fee2e2",borderRadius:6,background:"#fef2f2",textAlign:"center"}}>
      <div style={{fontSize:18,marginBottom:4}}>⚠</div>
      <div style={{fontSize:12,fontWeight:800,color:"#ef4444",letterSpacing:"0.05em"}}>INCIDENT DETECTED</div>
      <div style={{fontSize:11,color:"#b91c1c",marginTop:2}}>{vehicle.incident.type}</div>
    </div>}
    <div style={{padding:"10px 12px",fontSize:11}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 12px"}}>
        {[["Current Latitude",vehicle.lat.toFixed(6)],["Current Longitude",vehicle.lng.toFixed(6)],["Waypoint Index",vehicle.waypointIndex],["Speed",`${vehicle.displaySpeed.toFixed(0)} mph`],["Has Incident",vehicle.hasIncident?"True":"False"],["Fuel Level",`${vehicle.fuel.toFixed(0)}%`],vehicle.hasIncident?["Incident Type",vehicle.incident?.type]:["Cargo Temp",`${vehicle.temp.toFixed(1)}F`],["Driver",vehicle.driver]].map(([k,v])=>
          <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid #f0f0f5"}}>
            <span style={{color:"#888",fontSize:10}}>{k}</span><span style={{color:"#333",fontWeight:600,fontSize:10,fontFamily:"monospace"}}>{v}</span>
          </div>
        )}
      </div>
    </div>
    {vehicle.hasIncident && <div style={{padding:"8px 12px 12px",display:"flex",gap:8}}>
      <button onClick={onShowAI} style={{flex:1,padding:"8px 12px",background:"#0078D4",color:"#fff",border:"none",borderRadius:5,fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>🧠 Intelligence Brief</button>
    </div>}
  </div>;
}
