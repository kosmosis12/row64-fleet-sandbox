import { useEffect, useRef } from "react";
import { ROUTES, statusColor } from "../data/fleet";

function truckSvg(color, heading=0, hasIncident=false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <g transform="translate(18,18) rotate(${heading})">
      ${hasIncident?`<circle cx="0" cy="0" r="16" fill="${color}" opacity="0.15"><animate attributeName="r" values="14;20;14" dur="1.5s" repeatCount="indefinite"/></circle>`:""}
      <rect x="-7" y="-12" width="14" height="20" rx="3" fill="${color}" stroke="#fff" stroke-width="1.5"/>
      <rect x="-5" y="-12" width="10" height="6" rx="1.5" fill="${color==="#ef4444"?"#fca5a5":color==="#10b981"?"#6ee7b7":color==="#f59e0b"?"#fcd34d":"#d1d5db"}" opacity="0.7"/>
      <circle cx="-5" cy="7" r="2.5" fill="#374151" stroke="#fff" stroke-width="0.8"/>
      <circle cx="5" cy="7" r="2.5" fill="#374151" stroke="#fff" stroke-width="0.8"/>
      <rect x="-3" y="-10" width="6" height="3" rx="0.8" fill="rgba(255,255,255,0.5)"/>
      ${hasIncident?`<circle cx="7" cy="-12" r="5" fill="#ef4444" stroke="#fff" stroke-width="1"/><text x="7" y="-9" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold" font-family="Arial">!</text>`:""}</g></svg>`;
}

export default function FleetMap({ fleet, selected, onSelect }) {
  const mapRef = useRef(null), mapInst = useRef(null), markers = useRef({}), initd = useRef(false);

  useEffect(() => {
    if (initd.current || !mapRef.current) return;
    initd.current = true;
    if (!document.getElementById("leaflet-css")) {
      const l = document.createElement("link"); l.id = "leaflet-css"; l.rel = "stylesheet";
      l.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"; document.head.appendChild(l);
    }
    const loadL = () => new Promise(r => { if (window.L){r(window.L);return;} const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"; s.onload=()=>r(window.L); document.head.appendChild(s); });
    loadL().then(L => {
      const map = L.map(mapRef.current, {center:[38.5,-98],zoom:4,zoomControl:false,attributionControl:false});
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(map);
      L.control.zoom({position:"topright"}).addTo(map);
      L.control.attribution({position:"bottomright",prefix:false}).addAttribution("© OSM © CARTO").addTo(map);
      ROUTES.forEach(r=>{const pts=[r.from,...r.waypoints,r.to].map(([lng,lat])=>[lat,lng]);L.polyline(pts,{color:r.color,weight:2.5,opacity:0.4,dashArray:"8,6"}).addTo(map);});
      const citySet=new Set(); ROUTES.forEach(r=>{[[r.from,r.cities[0]],[r.to,r.cities[1]]].forEach(([coords,name])=>{if(!citySet.has(name)){citySet.add(name);L.marker([coords[1],coords[0]],{icon:L.divIcon({html:`<div style="width:10px;height:10px;border-radius:50%;background:#f59e0b;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.2)"></div>`,className:"",iconSize:[10,10],iconAnchor:[5,5]})}).addTo(map);}});});
      mapInst.current = map;
      fleet.forEach(v => {
        const color = statusColor(v.status);
        const icon = L.divIcon({html:truckSvg(color,v.heading,v.hasIncident),className:"",iconSize:[36,36],iconAnchor:[18,18]});
        const m = L.marker([v.lat,v.lng],{icon}).addTo(map);
        m.bindTooltip(`<div style="font-family:monospace;font-size:11px;font-weight:700">${v.id}</div><div style="font-size:10px;color:#666">${v.cargo} · ${v.displaySpeed.toFixed(0)}mph</div><div style="font-size:10px;color:${color};font-weight:600">${v.status}${v.hasIncident?" ⚠":""}</div>`,{direction:"top",offset:[0,-18],className:"tt"});
        m.on("click",()=>onSelect(v)); markers.current[v.id]=m;
      });
      const sty=document.createElement("style"); sty.textContent=`.tt{background:#fff;border:1px solid #e0e0e8;border-radius:6px;padding:6px 10px;box-shadow:0 2px 8px rgba(0,0,0,0.12)}.tt .leaflet-tooltip-tip{border-top-color:#fff}`; document.head.appendChild(sty);
    });
    return()=>{if(mapInst.current){mapInst.current.remove();mapInst.current=null;initd.current=false;}};
  }, []);

  useEffect(()=>{
    if(!window.L||!mapInst.current)return;
    fleet.forEach(v=>{const m=markers.current[v.id];if(!m)return;m.setLatLng([v.lat,v.lng]);const color=statusColor(v.status);const sel=selected?.id===v.id;m.setIcon(window.L.divIcon({html:truckSvg(sel?"#0078D4":color,v.heading,v.hasIncident),className:"",iconSize:[36,36],iconAnchor:[18,18]}));m.off("click").on("click",()=>onSelect(v));});
  },[fleet,selected]);

  useEffect(()=>{if(selected&&mapInst.current)mapInst.current.panTo([selected.lat,selected.lng],{animate:true,duration:0.5});},[selected]);

  return <div ref={mapRef} style={{width:"100%",height:"100%",borderRadius:6,overflow:"hidden"}}/>;
}
