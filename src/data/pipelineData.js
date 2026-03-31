// ── Row64 Sales Pipeline Data (sourced from HubSpot CRM) ──
// Last synced: 2026-03-31

const STAGE_MAP = {
  "1262996493": { label: "Discovery", prob: 0.20, order: 1 },
  "1262996494": { label: "Business Value", prob: 0.40, order: 2 },
  "1262996495": { label: "Technical Eval", prob: 0.60, order: 3 },
  "1262996496": { label: "Commercial", prob: 0.80, order: 4 },
  "1262996497": { label: "Finalizing", prob: 0.90, order: 5 },
  "closedwon":  { label: "Closed Won", prob: 1.0, order: 6 },
  "closedlost": { label: "Closed Lost", prob: 0.0, order: 7 },
};

const OWNER_MAP = {
  "86027544": "Kos",
  "83891790": "Ankit",
  "139402101": "Marc",
  "10517709": "Mark Pl.",
};

const RAW_DEALS = [
  { id: 58474845059, name: "TDK SensEI - NB - Operations", stageId: "1262996494", amount: 60000, close: "2026-05-31", created: "2026-03-27", ownerId: "83891790", contacts: 0, priority: null },
  { id: 58378540675, name: "KBC Advisors - NB - Economic Research", stageId: "1262996493", amount: 15000, close: null, created: "2026-03-25", ownerId: "86027544", contacts: 1, priority: "low" },
  { id: 58208212758, name: "Aerostar Dynamics - NB - Operations", stageId: "1262996495", amount: 60000, close: "2026-04-30", created: "2026-03-22", ownerId: "83891790", contacts: 2, priority: "high" },
  { id: 58055686488, name: "Water Services Tech - NB - Technology", stageId: "1262996494", amount: 15000, close: null, created: "2026-03-16", ownerId: "86027544", contacts: 1, priority: null },
  { id: 57980002738, name: "Workday - NB - Product", stageId: "1262996493", amount: 45000, close: "2026-09-18", created: "2026-03-15", ownerId: "86027544", contacts: 1, priority: "medium" },
  { id: 57830195258, name: "Tetra Tech - NB - Operations", stageId: "1262996493", amount: 15000, close: "2026-06-30", created: "2026-03-09", ownerId: "83891790", contacts: 0, priority: null },
  { id: 57635487812, name: "ESO - NB - CIO", stageId: "1262996494", amount: 45000, close: "2026-06-30", created: "2026-03-05", ownerId: "86027544", contacts: 1, priority: null },
  { id: 57601797762, name: "Glid Tech - NB - Operations", stageId: "1262996495", amount: 30000, close: "2026-05-29", created: "2026-03-05", ownerId: "86027544", contacts: 2, priority: "medium" },
  { id: 57019333654, name: "Invicta Racing - NB - Racing", stageId: "1262996493", amount: 15000, close: "2026-05-31", created: "2026-02-25", ownerId: "83891790", contacts: 1, priority: null },
  { id: 56828824583, name: "Northern Lights - NB - Partnership", stageId: "1262996495", amount: 45000, close: "2026-05-08", created: "2026-02-23", ownerId: "86027544", contacts: 2, priority: "high" },
  { id: 56709608768, name: "SeaVantage - NB - Business Development", stageId: "1262996494", amount: 30000, close: "2026-08-14", created: "2026-02-23", ownerId: "86027544", contacts: 2, priority: "medium" },
  { id: 56549512723, name: "Skymirr - NB - Operations", stageId: "1262996493", amount: 30000, close: "2026-09-30", created: "2026-02-17", ownerId: "86027544", contacts: 1, priority: "low" },
  { id: 56460911450, name: "Nauta - NB - Data", stageId: "1262996495", amount: 15000, close: "2026-05-22", created: "2026-02-17", ownerId: "86027544", contacts: 3, priority: "medium" },
  { id: 55624100757, name: "buildaidaho - NB - Product", stageId: "1262996495", amount: 20000, close: "2026-06-30", created: "2026-02-05", ownerId: "86027544", contacts: 1, priority: "high" },
  { id: 54353642250, name: "Nvidia - NB - Developer Program", stageId: "1262996495", amount: 50000, close: "2026-06-30", created: "2026-01-22", ownerId: "86027544", contacts: 1, priority: "medium" },
  { id: 53999295821, name: "Autura - NB - Business Intelligence", stageId: "1262996494", amount: 25000, close: "2026-06-27", created: "2026-01-15", ownerId: "86027544", contacts: 1, priority: "medium" },
  { id: 53550517543, name: "City of Washington DC Police Dept - NB - Emergency Services", stageId: "1262996493", amount: 50000, close: "2026-09-30", created: "2026-01-12", ownerId: "10517709", contacts: 0, priority: "medium" },
  { id: 53002239291, name: "Luxury Institute - NB - Retail", stageId: "1262996494", amount: 50000, close: "2026-09-30", created: "2026-01-02", ownerId: "139402101", contacts: 1, priority: "medium" },
  { id: 52556964649, name: "InGenius Data - NB - Operations", stageId: "1262996497", amount: 15000, close: "2026-03-31", created: "2025-12-31", ownerId: "86027544", contacts: 3, priority: "high" },
  { id: 51926013596, name: "Procon Analytics - NB - IT", stageId: "1262996495", amount: 15000, close: "2026-06-19", created: "2025-12-15", ownerId: "86027544", contacts: 1, priority: "medium" },
  { id: 51829963391, name: "Sysdig - NB - Data Analytics", stageId: "1262996493", amount: 15000, close: "2026-09-30", created: "2025-12-15", ownerId: "86027544", contacts: 1, priority: "low" },
  { id: 51831981425, name: "NRG Energy - NB - Product Innovation", stageId: "1262996493", amount: 15000, close: "2027-02-12", created: "2025-12-15", ownerId: "86027544", contacts: 1, priority: "low" },
  { id: 51875284584, name: "FINRA - NB - Observability", stageId: "1262996494", amount: 100000, close: null, created: "2025-12-08", ownerId: "83891790", contacts: 2, priority: "medium" },
  { id: 49134498645, name: "Health Equity - NB - Fraud Detection", stageId: "1262996494", amount: null, close: null, created: "2025-11-14", ownerId: "83891790", contacts: 1, priority: "medium" },
  { id: 49134498576, name: "Globant - NB - Factory / Supply Chain - BMW Project", stageId: "1262996493", amount: null, close: null, created: "2025-11-14", ownerId: "83891790", contacts: 1, priority: "medium" },
  { id: 49070750375, name: "Mastercard - NB - Financial Services", stageId: "1262996494", amount: 100000, close: "2026-09-30", created: "2025-11-14", ownerId: "139402101", contacts: 1, priority: "medium" },
  { id: 48859340966, name: "Dolftech - NB - Fueling Station Inspections", stageId: "1262996495", amount: null, close: "2026-04-30", created: "2025-11-10", ownerId: "83891790", contacts: 0, priority: "medium" },
  { id: 48474166380, name: "Pepperdine - NB - Analytics/Viz PHD", stageId: "1262996496", amount: 15000, close: "2026-06-30", created: "2025-11-07", ownerId: "139402101", contacts: 3, priority: "medium" },
  { id: 48327150459, name: "Insightful", stageId: "closedwon", amount: 15000, close: "2026-03-29", created: "2025-11-05", ownerId: "10517709", contacts: 2, priority: "medium" },
  { id: 39280160285, name: "World-Kinetic - NB - UTILITIES", stageId: "1262996493", amount: 150000, close: "2026-09-30", created: "2025-06-25", ownerId: "139402101", contacts: 1, priority: null },
  { id: 39278006633, name: "Metanet - NB - Manufacturing", stageId: "1262996493", amount: 120000, close: "2026-09-30", created: "2025-06-25", ownerId: "139402101", contacts: 1, priority: "medium" },
  { id: 38765238562, name: "kraken-tech - NB - Utilities", stageId: "1262996494", amount: 100000, close: "2026-09-30", created: "2025-06-11", ownerId: "139402101", contacts: 1, priority: "medium" },
  { id: 38777694002, name: "KTM - NB - Racing", stageId: "1262996496", amount: 35000, close: "2026-06-30", created: "2025-06-11", ownerId: "139402101", contacts: 1, priority: "medium" },
  { id: 30231208371, name: "NAVISTECH - NB - Government", stageId: "1262996494", amount: 120000, close: "2026-09-30", created: "2024-12-12", ownerId: "139402101", contacts: 1, priority: "medium" },
  { id: 30230743398, name: "SAIC - NB - Government", stageId: "1262996494", amount: 120000, close: "2026-09-30", created: "2024-12-12", ownerId: "139402101", contacts: 1, priority: "medium" },
  { id: 28547148294, name: "InclinedAnalytics - NB", stageId: "1262996493", amount: 120000, close: "2026-09-30", created: "2024-10-31", ownerId: "139402101", contacts: 0, priority: "medium" },
  { id: 23123902117, name: "SAP (via Mike Rockwell)", stageId: "1262996493", amount: 150000, close: "2026-09-30", created: "2024-10-09", ownerId: "139402101", contacts: 0, priority: null },
  { id: 23005133350, name: "Moment Factory - NB - RT Customer Telemetry", stageId: "1262996494", amount: 75000, close: "2026-09-30", created: "2024-10-07", ownerId: "139402101", contacts: 1, priority: null },
  { id: 22583445925, name: "Resecon - EB - HR Analytics", stageId: "1262996494", amount: 60000, close: "2026-09-30", created: "2024-09-24", ownerId: "139402101", contacts: 1, priority: "high" },
  { id: 22571854191, name: "Avangrid - EB - Utilities", stageId: "1262996494", amount: 120000, close: null, created: "2024-09-24", ownerId: "139402101", contacts: 1, priority: "high" },
  { id: 22583444818, name: "BAH - NB - Government", stageId: "1262996495", amount: 120000, close: "2026-09-30", created: "2024-09-24", ownerId: "139402101", contacts: 2, priority: "medium" },
  { id: 22013705567, name: "Verizon - EB - Utilities", stageId: "1262996494", amount: 120000, close: "2026-09-30", created: "2024-09-06", ownerId: "10517709", contacts: 1, priority: "high" },
];

// Closed lost deals (excluded from active pipeline)
const CLOSED_LOST = [
  { id: 58254495637, name: "Deloitte - NB - Finance & Banking", amount: 50000, close: "2026-03-23" },
  { id: 34356309787, name: "Bazze", amount: 120000, close: "2025-09-05" },
  { id: 28547149232, name: "GSA - NB - Fleet Data", amount: 120000, close: "2026-01-02" },
  { id: 22841060874, name: "GSA - NB - Government", amount: 120000, close: null },
  { id: 22997431116, name: "BAH - National Cemeteries", amount: 120000, close: "2024-10-25" },
  { id: 21993814293, name: "Adobe - Analytics", amount: 150000, close: "2024-11-13" },
];

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

export function getDeals() {
  const today = new Date().toISOString().slice(0, 10);
  return RAW_DEALS.filter(d => d.stageId !== "closedlost").map(d => {
    const stage = STAGE_MAP[d.stageId] || { label: "Unknown", prob: 0, order: 0 };
    const owner = OWNER_MAP[d.ownerId] || "Unknown";
    const daysOpen = daysBetween(d.created, today);
    const weighted = d.amount ? Math.round(d.amount * stage.prob) : 0;
    return {
      ...d,
      stage: stage.label,
      stageOrder: stage.order,
      prob: stage.prob,
      owner,
      daysOpen,
      weighted,
      industry: (d.name.match(/- ([^-]+)$/) || [, "General"])[1].trim(),
    };
  });
}

export function getClosedLost() { return CLOSED_LOST; }
export function getStageMap() { return STAGE_MAP; }
export function getOwnerMap() { return OWNER_MAP; }
