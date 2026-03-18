import { useState, useCallback } from "react";

const COLS = ["A","B","C","D","E","F","G","H","I","J","K"];
const ROWS = 30;

export default function SpreadsheetTab() {
  const [cells, setCells] = useState({});
  const [active, setActive] = useState(null);

  const cellKey = (r,c) => `${c}${r}`;
  const handleChange = useCallback((r,c,val) => setCells(prev => ({...prev,[cellKey(r,c)]:val})), []);

  return <div style={{width:"100%",height:"100%",background:"#fff",borderRadius:4,border:"2px dashed #0078D4",display:"flex",flexDirection:"column",overflow:"hidden"}}>
    {/* Toolbar */}
    <div style={{height:36,background:"#f8f9fc",display:"flex",alignItems:"center",padding:"0 8px",gap:4,borderBottom:"1px solid #e8eaef",flexShrink:0}}>
      <div style={{background:"#0078D4",color:"#fff",padding:"4px 10px",borderRadius:3,fontSize:10,fontWeight:800,letterSpacing:"0.06em",marginRight:8}}>SPREADSHEET</div>
      {["New","Set Area"].map(l=><button key={l} style={{background:"transparent",border:"none",color:"#444",padding:"4px 8px",fontSize:11,cursor:"pointer",fontWeight:500}}>{l}</button>)}
      <div style={{width:1,height:20,background:"#ddd",margin:"0 4px"}}/>
      {["B","I","U"].map(l=><button key={l} style={{width:28,height:28,background:"transparent",border:"1px solid #ddd",borderRadius:3,color:"#333",fontSize:12,fontWeight:l==="B"?800:l==="I"?400:400,fontStyle:l==="I"?"italic":"normal",textDecoration:l==="U"?"underline":"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{l}</button>)}
      <div style={{width:1,height:20,background:"#ddd",margin:"0 4px"}}/>
      {["Wrap Text","Format Cells","Merge","Unmerge"].map(l=><button key={l} style={{background:"transparent",border:"none",color:"#666",padding:"4px 8px",fontSize:10,cursor:"pointer"}}>{l}</button>)}
    </div>
    {/* Grid */}
    <div style={{flex:1,overflow:"auto"}}>
      <table style={{borderCollapse:"collapse",width:"100%",tableLayout:"fixed"}}>
        <thead><tr>
          <th style={{width:40,background:"#f0f2f8",border:"1px solid #e0e0e8",padding:"4px",fontSize:10,color:"#888",position:"sticky",top:0,zIndex:2}}/>
          {COLS.map(c=><th key={c} style={{width:100,background:"#f0f2f8",border:"1px solid #e0e0e8",padding:"4px",fontSize:10,fontWeight:600,color:"#555",position:"sticky",top:0,zIndex:2}}>{c}</th>)}
        </tr></thead>
        <tbody>{Array.from({length:ROWS},(_,r)=>r+1).map(r=>
          <tr key={r}>{[<td key="h" style={{background:r%2===0?"#fafbfc":"#f0f2f8",border:"1px solid #e0e0e8",padding:"2px 4px",fontSize:10,color:"#888",textAlign:"center",fontWeight:500}}>{r}</td>,
          ...COLS.map(c=><td key={c} style={{border:"1px solid #e0e0e8",padding:0,background:active===cellKey(r,c)?"#e8f0fe":r%2===0?"#fafbfc":"#fff"}}>
            <input value={cells[cellKey(r,c)]||""} onChange={e=>handleChange(r,c,e.target.value)} onFocus={()=>setActive(cellKey(r,c))} onBlur={()=>setActive(null)}
              style={{width:"100%",height:24,border:"none",outline:"none",padding:"2px 4px",fontSize:11,fontFamily:"'Segoe UI',sans-serif",background:"transparent"}}/>
          </td>)]}</tr>
        )}</tbody>
      </table>
    </div>
    {/* Bottom tabs */}
    <div style={{display:"flex",alignItems:"center",gap:6,padding:"4px 8px",borderTop:"1px solid #e8eaef",flexShrink:0}}>
      <div style={{background:"#f0f2f8",border:"1px solid #dde",borderRadius:3,padding:"3px 8px",fontSize:10,color:"#666"}}>Dash1</div>
      <div style={{background:"#d0e4f8",border:"1px solid #aac8e8",borderRadius:3,padding:"3px 8px",fontSize:10,color:"#0078D4",fontWeight:600}}>Sheet2</div>
      <div style={{width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",background:"#f0f2f8",border:"1px solid #dde",borderRadius:3,cursor:"pointer",color:"#0078D4",fontSize:14,fontWeight:700}}>+</div>
      <div style={{flex:1}}/>
      <div style={{fontSize:10,color:"#aaa"}}>Ready</div>
    </div>
  </div>;
}
