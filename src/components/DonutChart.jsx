export default function DonutChart({ data, size=80 }) {
  const total = data.reduce((s,d)=>s+d.value,0); let cum = 0;
  const r = size/2-8, cx = size/2, cy = size/2;
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    {data.map((d,i) => {
      const start = cum/total; cum += d.value; const end = cum/total;
      const sa = start*2*Math.PI-Math.PI/2, ea = end*2*Math.PI-Math.PI/2;
      const la = d.value/total > 0.5 ? 1 : 0;
      const x1=cx+r*Math.cos(sa),y1=cy+r*Math.sin(sa),x2=cx+r*Math.cos(ea),y2=cy+r*Math.sin(ea);
      return <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2} Z`} fill={d.color} opacity={0.8}/>;
    })}
    <circle cx={cx} cy={cy} r={r*0.55} fill="#f8f9fc"/>
  </svg>;
}
