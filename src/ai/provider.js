const APERTURE_BASE = "/ai";

const MODEL_PRIORITY = [
  { id: "gemini-3.1-flash-lite-preview", label: "Gemini 3.1 Flash-Lite", provider: "google" },
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash", provider: "google" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "google" },
  { id: "llama3.1:8b", label: "Llama 3.1 8B", provider: "ollama" },
  { id: "qwen3.5:9b-fast", label: "Qwen 3.5 Fast", provider: "ollama" },
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6", provider: "anthropic" },
];

const SYSTEM_PROMPT = `You are an AI fleet operations intelligence system for Row64. You analyze vehicle incidents, location data, and operational metrics to provide prescriptive recommendations. Be specific about locations, distances, nearby facilities, and actionable next steps. Keep responses concise and structured with INCIDENT BRIEF and NEXT BEST ACTION sections. Use markdown bold for section headers.`;

export async function queryAI(prompt, preferredModel) {
  const models = preferredModel
    ? [preferredModel, ...MODEL_PRIORITY.map(m => m.id).filter(m => m !== preferredModel)]
    : MODEL_PRIORITY.map(m => m.id);

  for (const model of models) {
    try {
      const response = await fetch(`${APERTURE_BASE}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer -" },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || null;
      if (text) return { model, text };
    } catch {
      continue;
    }
  }

  return { model: null, text: "All AI models unavailable. Check Aperture gateway status." };
}

export function getModelList() {
  return MODEL_PRIORITY;
}

export default { queryAI, getModelList };
