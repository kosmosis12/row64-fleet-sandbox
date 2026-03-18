export default function FileTab() {
  const items = [
    { icon:"📄", label:"New Project", key:"Ctrl+N" },
    { icon:"📂", label:"Open Project", key:"Ctrl+O" },
    { icon:"💾", label:"Save", key:"Ctrl+S" },
    { icon:"📋", label:"Save As...", key:"Ctrl+Shift+S" },
    { icon:"📤", label:"Export Dashboard", key:"" },
    { icon:"🖨️", label:"Print", key:"Ctrl+P" },
    { sep:true },
    { icon:"⚙️", label:"Project Settings", key:"" },
    { icon:"🔑", label:"API Keys & Providers", key:"" },
  ];
  return <div style={{width:"100%",height:"100%",background:"#fff",borderRadius:4,border:"2px dashed #0078D4",display:"flex",overflow:"hidden"}}>
    <div style={{width:260,background:"#f8f9fc",borderRight:"1px solid #e8eaef",padding:8}}>
      {items.map((it,i)=>it.sep?<div key={i} style={{height:1,background:"#e0e0e8",margin:"6px 12px"}}/>:
        <div key={it.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:4,cursor:"pointer",transition:"background 0.12s"}} onMouseEnter={e=>e.currentTarget.style.background="#eef0f5"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:16}}>{it.icon}</span><span style={{fontSize:12,color:"#333",fontWeight:500}}>{it.label}</span></div>
          {it.key&&<span style={{fontSize:10,color:"#aaa",fontFamily:"monospace"}}>{it.key}</span>}
        </div>)}
    </div>
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:8}}>
      <div style={{fontSize:48,opacity:0.15}}>64</div>
      <div style={{color:"#ccc",fontSize:12}}>Row64 Fleet Management Sandbox</div>
    </div>
  </div>;
}
