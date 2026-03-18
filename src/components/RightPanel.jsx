import { useMemo } from "react";
import DonutChart from "./DonutChart";
import Sparkline from "./Sparkline";
import { sparkData, FLEET_SIZE } from "../data/fleet";

export default function RightPanel({ fleet }) {
  const inT=fleet.filter(v=>v.status==="In Transit").length;
  const incidents=fleet.filter(v=>v.hasIncident).length;
  const hosComp=((fleet.filter(v=>parseFloat(v.hosRemaining)>1).length/fleet.length)*100).toFixed(1);
  const maintOk=fleet.filter(v=>v.milesNextService>200).length;
  const maintSoon=fleet.filter(v=>v.milesNextService<=200&&v.milesNextService>50).length;
  const maintCrit=fleet.filter(v=>v.milesNextService<=50).length;
  const fleetHealth=(maintOk/fleet.length*100).toFixed(1);

  return <div style={{display:"flex",flexDirection:"column",gap:8,minHeight:0,overflow:"hidden"}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,flexShrink:0}}>
      {[{l:"HOS Compliance",v:`${hosComp}%`,c:"#0078D4"},{l:"Fleet Health",v:`${fleetHealth}%`,c:"#10b981"},{l:"In Transit",v:`${inT}/${FLEET_SIZE}`,c:"#10b981"},{l:"Incidents",v:incidents,c:"#ef4444"}].map((k,i)=>
        <div key={i} style={{background:"#f8f9fc",borderRadius:6,padding:"10px 12px",border:"1px solid #e8eaef"}}>
          <div style={{fontSize:9,color:"#888",fontWeight:600,letterSpacing:"0.06em"}}>{k.l}</div>
          <div style={{fontSize:22,fontWeight:800,color:k.c,fontFamily:"Consolas,monospace",lineHeight:1,marginTop:4}}>{k.v}</div>
        </div>)}
    </div>
    <div style={{background:"#f8f9fc",borderRadius:6,padding:10,border:"1px solid #e8eaef",flexShrink:0}}>
      <div style={{fontSize:9,color:"#888",fontWeight:700,letterSpacing:"0.06em",marginBottom:6}}>HOURS OF SERVICE BY DRIVER</div>
      {fleet.filter(v=>v.status==="In Transit").slice(0,4).map(v=>
        <div key={v.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,fontSize:10}}>
          <span style={{width:85,color:"#666",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.driver}</span>
          <div style={{flex:1,display:"flex",gap:2,height:20}}>
            <div style={{flex:parseFloat(v.hosRemaining),background:"#0078D4",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:9,fontWeight:700}}>{v.hosRemaining}</div>
            <div style={{flex:14-parseFloat(v.hosRemaining),background:"#e8eaef",borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center",color:"#999",fontSize:9}}>{(14-parseFloat(v.hosRemaining)).toFixed(1)}</div>
          </div>
        </div>)}
    </div>
    <div style={{background:"#f8f9fc",borderRadius:6,padding:10,border:"1px solid #e8eaef",display:"flex",gap:12,alignItems:"center",flexShrink:0}}>
      <div><div style={{fontSize:9,color:"#888",fontWeight:700,letterSpacing:"0.06em",marginBottom:4}}>MAINTENANCE</div><DonutChart data={[{value:maintOk,color:"#10b981"},{value:maintSoon,color:"#0078D4"},{value:maintCrit,color:"#ef4444"}]} size={80}/></div>
      <div style={{fontSize:10,display:"flex",flexDirection:"column",gap:4}}>
        {[["OK",maintOk,"#10b981"],["Due Soon",maintSoon,"#0078D4"],["Critical",maintCrit,"#ef4444"]].map(([l,v,c])=>
          <div key={l} style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:2,background:c}}/><span style={{color:"#666"}}>{l}</span><span style={{fontWeight:700,color:"#333",fontFamily:"monospace"}}>{v}</span></div>)}
      </div>
    </div>
    <div style={{background:"#f8f9fc",borderRadius:6,padding:10,border:"1px solid #e8eaef",flex:1,minHeight:0}}>
      <div style={{fontSize:9,color:"#888",fontWeight:700,letterSpacing:"0.06em",marginBottom:6}}>MILES TILL NEXT SERVICE</div>
      <div style={{display:"flex",alignItems:"flex-end",gap:4,height:60}}>
        {fleet.slice(0,8).map(v=><div key={v.id} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <span style={{fontSize:8,color:"#888",fontFamily:"monospace"}}>{v.milesNextService}</span>
          <div style={{width:"100%",height:`${Math.min(v.milesNextService/6,50)}px`,background:v.milesNextService>200?"#93c5fd":v.milesNextService>50?"#0078D4":"#ef4444",borderRadius:"2px 2px 0 0"}}/>
          <span style={{fontSize:7,color:"#aaa",fontFamily:"monospace"}}>{v.id.replace("TRK-","")}</span>
        </div>)}
      </div>
    </div>
  </div>;
}
