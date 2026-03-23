import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { generateFleet, interpolateRoute, ROUTES } from "../data/fleet";

// Simulated fetch — replace with r64 compute query run when wired
const fetchFleetData = async () => {
  // In production: const resp = await fetch(`${R64_API_URL}/v1/compute/query`, { ... });
  return generateFleet();
};

// Fleet telemetry query — cached, auto-refreshed
export function useFleetData() {
  return useQuery({
    queryKey: ["r64", "fleet", "telemetry"],
    queryFn: fetchFleetData,
    staleTime: 30_000,
    refetchInterval: false, // We animate locally, not via refetch
  });
}

// Advance fleet positions — local mutation, no server round-trip
export function useFleetTick() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fleet) => {
      return fleet.map((v) => {
        if (v.speed === 0) return v;
        let np = v.progress + v.speed;
        if (np >= 1) np = 0.05;
        const [nLng, nLat] = interpolateRoute(ROUTES[v.routeIdx], np);
        const heading =
          Math.atan2(nLng - v.lng, nLat - v.lat) * (180 / Math.PI);
        return {
          ...v,
          progress: np,
          lat: nLat,
          lng: nLng,
          heading,
          waypointIndex: Math.floor(np * 10000),
        };
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["r64", "fleet", "telemetry"], updated);
    },
  });
}

// AI query — cached per prompt
export function useAIQuery(provider, prompt, apiKey, model, enabled = false) {
  return useQuery({
    queryKey: ["r64", "ai", provider, prompt?.slice(0, 50)],
    queryFn: async () => {
      const { queryAI } = await import("../ai/provider");
      return queryAI(provider, prompt, apiKey, model);
    },
    enabled: enabled && !!prompt,
    staleTime: Infinity,
    gcTime: 60 * 60 * 1000,
  });
}
