import { useState } from "react";
import Sparkline from "../components/Sparkline";
import DonutChart from "../components/DonutChart";
import { sparkData } from "../data/fleet";

const CHART_TYPES = [
  { id:"scatter", icon:"⁞⁞", label:"New Scatter" },
  { id:"line", icon:"📈", label:"New Line" },
  { id:"bar", icon:"📊", label:"New Bar" },
  { id:"hbar", icon:"☰", label:"New HBar" },
  { id:"pie", icon:"🥧", label:"New Pie" },
  { id:"venn", icon:"◎", label:"New Venn" },
  { id:"geo", icon:"📍", label:"Geo 2D" },
  { id:"bubble", icon:"◉", label:"New Bubble" },
  { id:"wordcloud", icon:"🔤", label:"Word Cloud" },
];

const sampleData1 = sparkData(12, 200, 40);
const sampleData2 = sparkData(12, 150, 30);
const sampleData3 = sparkData(12, 100, 25);
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function SampleBarChart() {
  const max = Math.max(...sampleData1);
  return <div style={{padding:20}}>
    <div style={{fontSize:13,fontWeight:700,color:"#333",marginBottom:12}}>Monthly Fleet Utilization</div>
    <div style={{display:"flex",alignItems:"flex-end",gap:6,height:150}}>
      {sampleData1.map((d,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
        <span style={{fontSize:8,color:"#888"}}>{d.toFixed(0)}</span>
        <div style={{width:"100%",height:`${(d/max)*120}px`,background:i===11?"#0078D4":"#93c5fd",borderRadius:"3px 3px 0 0",transition:"height 0.3s"}}/>
        <span style={{fontSize:8,color:"#999"}}>{months[i]}</span>
      </div>)}
    </div>
  </div>;
}

function SampleLineChart() {
  const w=400,h=150,mx=Math.max(...sampleData2,...sampleData3),mn=Math.min(...sampleData2,...sampleData3),r=mx-mn||1;
  const toPoints=(data)=>data.map((d,i)=>`${(i/(data.length-1))*w},${h-10-((d-mn)/r)*(h-20)}`).join(" ");
  return <div style={{padding:20}}>
    <div style={{fontSize:13,fontWeight:700,color:"#333",marginBottom:12}}>Speed vs Fuel Efficiency Trend</div>
    <svg width={w} height={h}><polyline points={toPoints(sampleData2)} fill="none" stroke="#0078D4" strokeWidth="2"/><polyline points={toPoints(sampleData3)} fill="none" stroke="#10b981" strokeWidth="2"/></svg>
    <div style={{display:"flex",gap:16,marginTop:6}}><div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#666"}}><div style={{width:12,height:3,background:"#0078D4",borderRadius:2}}/>Avg Speed</div><div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#666"}}><div style={{width:12,height:3,background:"#10b981",borderRadius:2}}/>Fuel Eff.</div></div>
  </div>;
}

function SamplePieChart() {
  return <div style={{padding:20,display:"flex",alignItems:"center",gap:24}}>
    <div><div style={{fontSize:13,fontWeight:700,color:"#333",marginBottom:12}}>Fleet by Cargo Type</div>
      <DonutChart data={[{value:35,color:"#0078D4"},{value:25,color:"#10b981"},{value:20,color:"#f59e0b"},{value:15,color:"#8b5cf6"},{value:5,color:"#ef4444"}]} size={140}/>
    </div>
    <div style={{fontSize:10,display:"flex",flexDirection:"column",gap:6}}>
      {[["Electronics",35,"#0078D4"],["Perishables",25,"#10b981"],["Heavy Haul",20,"#f59e0b"],["Auto Parts",15,"#8b5cf6"],["Medical",5,"#ef4444"]].map(([l,v,c])=>
        <div key={l} style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:10,height:10,borderRadius:2,background:c}}/><span style={{color:"#666"}}>{l}</span><span style={{fontWeight:700,color:"#333"}}>{v}%</span></div>)}
    </div>
  </div>;
}

const SAMPLES = { scatter:<SampleLineChart/>, line:<SampleLineChart/>, bar:<SampleBarChart/>, hbar:<SampleBarChart/>, pie:<SamplePieChart/>, venn:<SamplePieChart/>, geo:<div style={{padding:40,textAlign:"center",color:"#aaa"}}>Geo 2D — see Dashboard tab for live map</div>, bubble:<SampleLineChart/>, wordcloud:<div style={{padding:40,textAlign:"center",color:"#aaa",fontSize:11}}>Word Cloud — requires text data source</div> };

export default function ChartTab() {
  const [selected, setSelected] = useState("bar");
  return <div style={{width:"100%",height:"100%",background:"#fff",borderRadius:4,border:"2px dashed #0078D4",display:"flex",overflow:"hidden"}}>
    <div style={{width:200,background:"#f8f9fc",borderRight:"1px solid #e8eaef",padding:8}}>
      <div style={{background:"#0078D4",color:"#fff",padding:"4px 10px",borderRadius:3,fontSize:10,fontWeight:800,letterSpacing:"0.06em",marginBottom:12,display:"inline-block"}}>NO CHART SELECTED</div>
      <div style={{padding:"8px 12px",fontSize:12,fontWeight:600,color:"#333",marginBottom:4}}>New Chart</div>
      {CHART_TYPES.map(ct=><div key={ct.id} onClick={()=>setSelected(ct.id)} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderRadius:4,cursor:"pointer",background:selected===ct.id?"#e8f0fe":"transparent",transition:"background 0.12s",marginBottom:1}} onMouseEnter={e=>{if(selected!==ct.id)e.currentTarget.style.background="#eef0f5"}} onMouseLeave={e=>{if(selected!==ct.id)e.currentTarget.style.background="transparent"}}>
        <span style={{fontSize:16,width:20,textAlign:"center"}}>{ct.icon}</span><span style={{fontSize:11,color:"#444",fontWeight:500}}>{ct.label}</span>
      </div>)}
    </div>
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>{SAMPLES[selected]||<div style={{color:"#ccc"}}>Select a chart type</div>}</div>
  </div>;
}
