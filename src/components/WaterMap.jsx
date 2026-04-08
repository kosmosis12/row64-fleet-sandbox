import { useEffect, useRef } from "react";
import { PRIORITY_COLORS, WATER_MAP_CENTER } from "../data/water";

function markerSvg(color, leak) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
    ${leak ? `<circle cx="11" cy="11" r="10" fill="${color}" opacity="0.22"><animate attributeName="r" values="8;12;8" dur="1.6s" repeatCount="indefinite"/></circle>` : ""}
    <circle cx="11" cy="11" r="6" fill="${color}" stroke="#ffffff" stroke-width="2"/>
  </svg>`;
}

export default function WaterMap({ orders, selected, onSelect }) {
  const mapRef = useRef(null);
  const mapInst = useRef(null);
  const markers = useRef({});
  const initd = useRef(false);

  useEffect(() => {
    if (initd.current || !mapRef.current) return;
    initd.current = true;
    if (!document.getElementById("leaflet-css")) {
      const l = document.createElement("link");
      l.id = "leaflet-css";
      l.rel = "stylesheet";
      l.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(l);
    }
    const loadL = () =>
      new Promise((r) => {
        if (window.L) {
          r(window.L);
          return;
        }
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
        s.onload = () => r(window.L);
        document.head.appendChild(s);
      });
    loadL().then((L) => {
      const map = L.map(mapRef.current, {
        center: [WATER_MAP_CENTER.lat, WATER_MAP_CENTER.lng],
        zoom: WATER_MAP_CENTER.zoom,
        zoomControl: false,
        attributionControl: false,
      });
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        { maxZoom: 19 }
      ).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      L.control
        .attribution({ position: "bottomright", prefix: false })
        .addAttribution("© OSM © CARTO")
        .addTo(map);
      mapInst.current = map;

      orders.forEach((o) => {
        const color = PRIORITY_COLORS[o.priority] || "#6b7280";
        const icon = L.divIcon({
          html: markerSvg(color, o.leakDetected),
          className: "",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        const m = L.marker([o.lat, o.lng], { icon }).addTo(map);
        m.bindTooltip(
          `<div style="font-family:monospace;font-size:11px;font-weight:700">${o.id}</div>` +
            `<div style="font-size:10px;color:#666">${o.type} · ${o.crew}</div>` +
            `<div style="font-size:10px;color:${color};font-weight:600">${o.priority}${
              o.leakDetected ? " · LEAK" : ""
            }</div>`,
          { direction: "top", offset: [0, -10], className: "tt" }
        );
        m.on("click", () => onSelect && onSelect(o));
        markers.current[o.id] = m;
      });
    });
    return () => {
      if (mapInst.current) {
        mapInst.current.remove();
        mapInst.current = null;
        initd.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!window.L || !mapInst.current) return;
    orders.forEach((o) => {
      const m = markers.current[o.id];
      if (!m) return;
      const color = PRIORITY_COLORS[o.priority] || "#6b7280";
      const sel = selected?.id === o.id;
      m.setIcon(
        window.L.divIcon({
          html: markerSvg(sel ? "#0078D4" : color, o.leakDetected),
          className: "",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        })
      );
    });
  }, [orders, selected]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", borderRadius: 6, overflow: "hidden" }}
    />
  );
}
