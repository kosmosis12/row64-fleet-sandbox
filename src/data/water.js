// Water Utilities field operations dataset. ASCII-only strings.
// Represents work orders / asset readings across a metro water district.
export const WORK_ORDER_TYPES = [
  "Meter Reading",
  "Leak Repair",
  "Main Break",
  "Valve Inspection",
  "Hydrant Flush",
  "Pressure Test",
];

export const WATER_STATUSES = ["Open", "In Progress", "Completed", "Escalated"];
export const WATER_PRIORITIES = ["Low", "Medium", "High", "Emergency"];
export const WATER_CREWS = ["Alpha-1", "Alpha-2", "Bravo-1", "Bravo-2", "Charlie-1"];
export const SERVICE_AREAS = [
  "North District",
  "South District",
  "East District",
  "West District",
  "Central",
];
export const PIPE_MATERIALS = ["PVC", "Cast Iron", "Ductile Iron", "Copper", "HDPE"];
export const DIAMETERS = [4, 6, 8, 12, 16, 24];

// Representative US metro grid (Denver-ish lat/lng cluster) for field crews.
const AREA_CENTERS = {
  "North District":   { lat: 39.82, lng: -104.99 },
  "South District":   { lat: 39.62, lng: -104.96 },
  "East District":    { lat: 39.74, lng: -104.82 },
  "West District":    { lat: 39.73, lng: -105.13 },
  "Central":          { lat: 39.74, lng: -104.99 },
};

const TECH_NAMES = [
  "Ethan Brooks", "Nadia Patel", "Marcus Reed", "Priya Shah",
  "Luis Ortiz", "Hannah Park", "Devon Hayes", "Rachel Kim",
  "Omar Nassar", "Sophie Lang", "Terrence Vale", "Aiko Tanaka",
];

const NOTE_TEMPLATES = {
  "Meter Reading":    "Routine meter cycle read; no anomalies observed",
  "Leak Repair":      "Audible leak at service tap; excavation scheduled",
  "Main Break":       "12in main failure reported; isolation valves closed",
  "Valve Inspection": "Quarterly gate valve exercise and torque check",
  "Hydrant Flush":    "Unidirectional flushing to remove sediment buildup",
  "Pressure Test":    "Hydrostatic test on new service line segment",
};

const STATUS_WEIGHTS = ["Open", "Open", "In Progress", "In Progress", "Completed", "Completed", "Completed", "Escalated"];
const PRIORITY_WEIGHTS = ["Low", "Low", "Low", "Medium", "Medium", "Medium", "High", "High", "Emergency"];

// Seeded pseudo-random so the dataset is stable across reloads in the demo.
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rand, arr) => arr[Math.floor(rand() * arr.length)];
const between = (rand, a, b) => a + rand() * (b - a);
const betweenInt = (rand, a, b) => Math.floor(between(rand, a, b + 1));

function dateString(rand, daysAgoMax) {
  const now = new Date("2026-04-08T00:00:00Z").getTime();
  const offset = Math.floor(rand() * daysAgoMax) * 86400000;
  return new Date(now - offset).toISOString().slice(0, 10);
}

export function generateWaterData(count = 36) {
  const rand = mulberry32(42);
  const rows = [];
  for (let i = 0; i < count; i++) {
    const type = pick(rand, WORK_ORDER_TYPES);
    const status = pick(rand, STATUS_WEIGHTS);
    const priority = pick(rand, PRIORITY_WEIGHTS);
    const crew = pick(rand, WATER_CREWS);
    const serviceArea = pick(rand, SERVICE_AREAS);
    const center = AREA_CENTERS[serviceArea];
    const lat = center.lat + between(rand, -0.06, 0.06);
    const lng = center.lng + between(rand, -0.08, 0.08);

    const isLeakType = type === "Leak Repair" || type === "Main Break";
    const leakDetected = isLeakType || (type === "Meter Reading" && rand() < 0.08);
    const pressurePSI = Math.round(
      isLeakType ? between(rand, 20, 55) : between(rand, 55, 120)
    );
    const flowGPM = Math.round(
      type === "Main Break" ? between(rand, 250, 500)
      : type === "Hydrant Flush" ? between(rand, 150, 400)
      : between(rand, 0, 220)
    );
    const meterReading = betweenInt(rand, 10000, 99999);
    const pipeAgeDays = betweenInt(rand, 365, 18250);
    const pipeMaterial = pick(rand, PIPE_MATERIALS);
    const diameterInch = pick(rand, DIAMETERS);
    const estimatedLossGPD = leakDetected ? betweenInt(rand, 200, 5000) : 0;
    const assignedTech = pick(rand, TECH_NAMES);
    const scheduledDate = dateString(rand, 14);
    const completedDate = status === "Completed" ? dateString(rand, 7) : null;

    rows.push({
      id: `WO-${String(i + 1).padStart(3, "0")}`,
      type,
      status,
      priority,
      crew,
      serviceArea,
      lat: +lat.toFixed(5),
      lng: +lng.toFixed(5),
      pressurePSI,
      flowGPM,
      meterReading,
      pipeAgeDays,
      pipeMaterial,
      diameterInch,
      leakDetected,
      estimatedLossGPD,
      assignedTech,
      scheduledDate,
      completedDate,
      notes: NOTE_TEMPLATES[type],
    });
  }
  return rows;
}

export const PRIORITY_COLORS = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#fb923c",
  Emergency: "#ef4444",
};

export const STATUS_COLORS = {
  Open: "#6b7280",
  "In Progress": "#0078D4",
  Completed: "#10b981",
  Escalated: "#ef4444",
};

// Central map centroid for the water district view.
export const WATER_MAP_CENTER = { lat: 39.74, lng: -104.99, zoom: 10 };
