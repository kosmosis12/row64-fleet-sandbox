export default function DataTab() {
  const items = [
    { icon:"🗄️", label:"Get Data", desc:"Connect to external data sources" },
    { icon:"🖥️", label:"Server Data", desc:"Browse Row64 Server datasets" },
    { icon:"📥", label:"Import Data", desc:"Import CSV, JSON, Parquet files" },
    { icon:"📁", label:"Upload File Assets", desc:"Upload images, documents, media" },
  ];
  return <div style={{width:"100%",height:"100%",background:"#fff",borderRadius:4,border:"2px dashed #0078D4",display:"flex",overflow:"hidden"}}>
    <div style={{width:240,background:"#f8f9fc",borderRight:"1px solid #e8eaef",padding:8}}>
      <div style={{background:"#0078D4",color:"#fff",padding:"4px 10px",borderRadius:3,fontSize:10,fontWeight:800,letterSpacing:"0.06em",marginBottom:12,display:"inline-block"}}>NO DATA SELECTED</div>
      {items.map(it=><div key={it.label} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:6,cursor:"pointer",transition:"background 0.12s",marginBottom:2}} onMouseEnter={e=>e.currentTarget.style.background="#eef0f5"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <span style={{fontSize:20}}>{it.icon}</span>
        <div><div style={{fontSize:12,fontWeight:600,color:"#333"}}>{it.label}</div><div style={{fontSize:10,color:"#888"}}>{it.desc}</div></div>
      </div>)}
    </div>
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#ccc",fontSize:13}}>Select a data source to begin</div>
  </div>;
}
