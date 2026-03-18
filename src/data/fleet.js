export const ROUTES = [
  { id:"RTE01", from:[-118.24,33.94], to:[-112.07,33.45], label:"LAX → PHX", cities:["LAX","PHX"], color:"#10b981", waypoints:[[-117.1,34.1],[-115.5,33.8],[-114.2,33.5]] },
  { id:"RTE02", from:[-112.07,33.45], to:[-104.99,39.74], label:"PHX → DEN", cities:["PHX","DEN"], color:"#0078D4", waypoints:[[-111.0,34.8],[-109.0,36.2],[-107.0,37.8]] },
  { id:"RTE03", from:[-104.99,39.74], to:[-94.58,39.1], label:"DEN → KC", cities:["DEN","KC"], color:"#f59e0b", waypoints:[[-102.5,39.5],[-100.0,39.3],[-97.5,39.2]] },
  { id:"RTE04", from:[-94.58,39.1], to:[-87.63,41.88], label:"KC → CHI", cities:["KC","CHI"], color:"#10b981", waypoints:[[-93.0,39.8],[-91.0,40.5],[-89.5,41.2]] },
  { id:"RTE05", from:[-87.63,41.88], to:[-84.39,33.75], label:"CHI → ATL", cities:["CHI","ATL"], color:"#ef4444", waypoints:[[-87.0,40.0],[-86.0,38.0],[-85.0,36.0]] },
  { id:"RTE06", from:[-84.39,33.75], to:[-80.19,25.76], label:"ATL → MIA", cities:["ATL","MIA"], color:"#8b5cf6", waypoints:[[-83.5,31.5],[-82.0,29.0],[-81.0,27.0]] },
  { id:"RTE07", from:[-118.24,33.94], to:[-115.14,36.17], label:"LAX → LV", cities:["LAX","LV"], color:"#f59e0b", waypoints:[[-117.5,34.5],[-116.5,35.2],[-115.8,35.8]] },
  { id:"RTE08", from:[-122.42,37.77], to:[-122.33,47.61], label:"SF → SEA", cities:["SF","SEA"], color:"#10b981", waypoints:[[-122.8,39.5],[-123.0,42.0],[-122.8,44.5]] },
  { id:"RTE09", from:[-96.8,32.78], to:[-95.37,29.76], label:"DAL → HOU", cities:["DAL","HOU"], color:"#0078D4", waypoints:[[-96.5,32.0],[-96.0,31.2],[-95.7,30.5]] },
  { id:"RTE10", from:[-74.0,40.71], to:[-71.06,42.36], label:"NYC → BOS", cities:["NYC","BOS"], color:"#ef4444", waypoints:[[-73.2,41.0],[-72.5,41.3],[-71.8,41.8]] },
];
export const FLEET_SIZE = 24;
const STATUSES = ["In Transit","In Transit","In Transit","In Transit","Delayed","At Dock","Maintenance"];
const CARGO = ["Electronics","Perishables","Heavy Haul","Auto Parts","Medical","Retail","Raw Materials"];
export const INCIDENTS = [
  { type:"Electrical Fault", brief:"Vehicle has reported an electrical fault, requiring immediate attention to prevent potential breakdown or safety hazards.", action:"Instruct driver to safely pull over and shut down non-essential electrical systems. Do not continue driving with electrical faults due to fire risk. Contact mobile truck repair services in the nearest area." },
  { type:"Tire Pressure Warning", brief:"Tire pressure sensor triggered below threshold on rear axle. Continued operation risks blowout and cargo damage.", action:"Reduce speed to 45mph max. Route to nearest truck stop with tire service within 15 miles. If pressure drops further, pull over immediately and deploy hazard triangles." },
  { type:"Cargo Temp Exceedance", brief:"Refrigeration unit reporting temperature above acceptable range for perishable cargo. Threshold breached by 3.2F.", action:"Check reefer unit status remotely. If running, likely door seal issue — verify all doors sealed at next safe stop. If unit offline, dispatch emergency reefer repair." },
  { type:"HOS Violation Risk", brief:"Driver approaching maximum Hours of Service limit. Estimated 45 minutes remaining before mandatory 10-hour rest period.", action:"Identify nearest safe parking within 30-min drive radius. Notify receiver of potential delivery delay. Coordinate relay driver from nearest terminal." },
  { type:"Route Deviation", brief:"Vehicle deviated from planned route by more than 5 miles. No construction or weather alerts on planned route.", action:"Contact driver to confirm reason for deviation. If unauthorized, log incident and notify dispatch supervisor. Update route in TMS and recalculate ETA." },
];
export function interpolateRoute(route, progress) {
  const pts = [route.from, ...route.waypoints, route.to];
  const segs = pts.length - 1, sf = progress * segs, si = Math.min(Math.floor(sf), segs - 1), sp = sf - si;
  return [pts[si][0] + (pts[si+1][0] - pts[si][0]) * sp, pts[si][1] + (pts[si+1][1] - pts[si][1]) * sp];
}
export function generateFleet() {
  return Array.from({ length: FLEET_SIZE }, (_, i) => {
    const route = ROUTES[i % ROUTES.length], progress = Math.random() * 0.85 + 0.05;
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const [lng, lat] = interpolateRoute(route, progress);
    const hasIncident = status === "Delayed" || (status === "In Transit" && Math.random() < 0.15);
    const incident = hasIncident ? INCIDENTS[Math.floor(Math.random() * INCIDENTS.length)] : null;
    return {
      id:`TRK-${String(i+1).padStart(3,"0")}`, driver:`${["Andrew","Sarah","Joseph","Anthony","Maria","David","Lisa","James"][i%8]} ${["Harris","Clark","Sanchez","White","Garcia","Lee","Johnson","Brown"][i%8]}`,
      route:route.label, routeId:route.id, routeIdx:i%ROUTES.length, status, cargo:CARGO[i%CARGO.length],
      lat, lng, progress, speed:status==="In Transit"?0.0003+Math.random()*0.0004:status==="Delayed"?0.00005:0,
      displaySpeed:status==="In Transit"?45+Math.random()*25:status==="Delayed"?5+Math.random()*15:0,
      fuel:30+Math.random()*65, temp:34+Math.random()*8, eta:`${Math.floor(1+Math.random()*14)}h ${Math.floor(Math.random()*60)}m`,
      heading:0, hasIncident, incident, hosRemaining:(2+Math.random()*11).toFixed(1), milesNextService:Math.floor(100+Math.random()*600), waypointIndex:Math.floor(progress*10000),
    };
  });
}
export function sparkData(n=20,b=50,v=15){const d=[b];for(let i=1;i<n;i++)d.push(Math.max(0,d[i-1]+(Math.random()-0.48)*v));return d;}
export const statusColor = s => s==="Delayed"?"#ef4444":s==="In Transit"?"#10b981":s==="At Dock"?"#f59e0b":"#6b7280";
