// Shared copilot system prompt builder for both Fleet and Water chart builders.
// The returned prompt instructs the local model (Ollama gemma4:26b) on the
// chart builder config schema and the available columns for the current mode.

const SCHEMA_HINT = `You respond ONLY with a single JSON object matching this shape, no prose:
{
  "chartType": "bar" | "line" | "scatter" | "heatmap",
  "x": <column key>,
  "y": <column key>,
  "groupBy": <column key> | null,
  "agg": "sum" | "avg" | "count" | "min" | "max",
  "filters": [ { "column": <key>, "min": <num|""> , "max": <num|"">, "values": [<str>...] } ]
}
- y must reference a numeric column (or "count" aggregation).
- For scatter, both x and y should be numeric columns; agg is ignored.
- Omit filters you do not need (empty array is fine).
- NEVER invent columns outside the provided list.`;

const FLEET_ROLE = `You are a Row64 Fleet Operations chart copilot. You help dispatchers, logistics planners, and fleet managers build visualizations over live truck telemetry: positions, speed, fuel, temperature, hours of service, and service intervals. When the user asks an ambiguous question, pick the chart config that best surfaces the operational insight (e.g. fuel by route, speed by status).`;

const WATER_ROLE = `You are a Row64 Water Utility Operations chart copilot. You help water utility field supervisors and asset managers visualize field work orders, meter readings, leak detection, pipe conditions, and crew performance. Prefer chart configs that highlight leak loss, pressure anomalies, aging infrastructure, and escalated work. When the user asks an ambiguous question, pick the config that surfaces the operational or asset-health insight most clearly.`;

function formatColumnDefs(defs) {
  return defs
    .map((c) => `- ${c.key} (${c.type}) — ${c.label}`)
    .join("\n");
}

export function buildCopilotSystemPrompt({ mode = "fleet", columnDefs = [] } = {}) {
  const role = mode === "water" ? WATER_ROLE : FLEET_ROLE;
  return `${role}

Available columns for this dataset:
${formatColumnDefs(columnDefs)}

${SCHEMA_HINT}`;
}

// Ollama chat endpoint used by the copilot drawer.
export const OLLAMA_ENDPOINT = "http://localhost:11434/api/chat";
export const OLLAMA_MODEL = "gemma4:26b";

// Attempt to pull a JSON object out of the model's response, tolerating
// leading/trailing prose or ```json fences that some local models emit.
export function extractChartConfig(text) {
  if (!text || typeof text !== "string") return null;
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fence ? fence[1] : text;
  const first = candidate.indexOf("{");
  const last = candidate.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  try {
    return JSON.parse(candidate.slice(first, last + 1));
  } catch {
    return null;
  }
}
