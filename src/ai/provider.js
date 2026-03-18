const PROVIDERS = {
  claude: {
    name: "Claude (Anthropic)",
    endpoint: "https://api.anthropic.com/v1/messages",
    model: "claude-sonnet-4-20250514",
    buildRequest: (prompt, apiKey) => ({
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1024, messages: [{ role: "user", content: prompt }] }),
    }),
    parseResponse: (data) => data.content?.[0]?.text || "No response generated.",
  },
  gemini: {
    name: "Gemini (Google)",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    model: "gemini-2.0-flash",
    buildRequest: (prompt, apiKey) => ({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }),
    getUrl: (apiKey) => `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    parseResponse: (data) => data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.",
  },
  ollama: {
    name: "Ollama (Local)",
    endpoint: "http://localhost:11434/api/generate",
    model: "qwen3:8b",
    buildRequest: (prompt, _apiKey, model) => ({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: model || "qwen3:8b", prompt, stream: false }),
    }),
    parseResponse: (data) => data.response || "No response generated.",
  },
};

export async function queryAI(provider, prompt, apiKey, model) {
  const p = PROVIDERS[provider];
  if (!p) throw new Error(`Unknown provider: ${provider}`);
  
  const systemPrompt = `You are an AI fleet operations intelligence system for Row64. You analyze vehicle incidents, location data, and operational metrics to provide prescriptive recommendations. Be specific about locations, distances, nearby facilities, and actionable next steps. Keep responses concise and structured with INCIDENT BRIEF and NEXT BEST ACTION sections. Use markdown bold for section headers.`;
  const fullPrompt = `${systemPrompt}\n\n${prompt}`;
  
  try {
    const config = p.buildRequest(fullPrompt, apiKey, model);
    const url = p.getUrl ? p.getUrl(apiKey) : p.endpoint;
    const response = await fetch(url, config);
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`${p.name} API error (${response.status}): ${err.slice(0, 200)}`);
    }
    const data = await response.json();
    return p.parseResponse(data);
  } catch (error) {
    return `Error from ${p.name}: ${error.message}`;
  }
}

export function getProviderList() {
  return Object.entries(PROVIDERS).map(([key, val]) => ({ key, name: val.name, model: val.model }));
}

export default PROVIDERS;
