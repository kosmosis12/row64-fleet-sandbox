export default function Sparkline({data,color="#0078D4",w=80,h=26}){
  const mx=Math.max(...data),mn=Math.min(...data),r=mx-mn||1;
  const pts=data.map((d,i)=>`${(i/(data.length-1))*w},${h-2-((d-mn)/r)*(h-4)}`).join(" ");
  const gid=`sg${color.replace("#","")}${w}`;
  return <svg width={w} height={h} style={{display:"block"}}><defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0.02"/></linearGradient></defs><polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${gid})`}/><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
