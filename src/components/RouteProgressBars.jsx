import { ROUTES } from "../data/fleet";
function RouteBar({ route, trucks }) {
  const rt = trucks.filter(t => t.routeIdx === ROUTES.indexOf(route));
  return <div style={{display:"flex",alignItems:"center",gap:0,flex:1,minWidth:0}}>
    <span style={{fontSize:8,color:"#999",fontWeight:700,letterSpacing:"0.05em",minWidth:32,textAlign:"right",marginRight:4}}>{route.id}</span>
    <div style={{flex:1,position:"relative",height:20,display:"flex",alignItems:"center"}}>
      <div style={{position:"absolute",left:0,right:0,height:6,borderRadius:3,background:"#e8eaef"}}/>
      <div style={{position:"absolute",left:0,height:6,borderRadius:3,background:route.color,opacity:0.7,width:rt.length>0?`${Math.max(...rt.map(t=>t.progress))*100}%`:"0%"}}/>
      {route.cities.map((c,i)=><div key={c} style={{position:"absolute",left:i===0?0:"auto",right:i===1?0:"auto",top:-8,fontSize:8,fontWeight:700,color:"#666",letterSpacing:"0.03em"}}>{c}</div>)}
      {rt.map(t=><div key={t.id} style={{position:"absolute",left:`${t.progress*100}%`,top:"50%",transform:"translate(-50%,-50%)",width:t.hasIncident?10:8,height:t.hasIncident?10:8,borderRadius:"50%",background:t.status==="Delayed"?"#ef4444":t.status==="In Transit"?route.color:"#f59e0b",border:t.hasIncident?"2px solid #ef4444":"1.5px solid #fff",boxShadow:t.hasIncident?"0 0 6px rgba(239,68,68,0.5)":"0 1px 3px rgba(0,0,0,0.15)",zIndex:2}}/>)}
    </div>
  </div>;
}
export default function RouteProgressBars({ fleet }) {
  return <div style={{flexShrink:0,display:"flex",flexDirection:"column",gap:10,padding:"6px 8px",background:"#f8f9fc",borderRadius:6,border:"1px solid #e8eaef"}}>
    <div style={{display:"flex",gap:12}}>{ROUTES.slice(0,5).map(r=><RouteBar key={r.id} route={r} trucks={fleet}/>)}</div>
    <div style={{display:"flex",gap:12}}>{ROUTES.slice(5,10).map(r=><RouteBar key={r.id} route={r} trucks={fleet}/>)}</div>
  </div>;
}
