import { useQuery } from "@tanstack/react-query";

const BRIDGE_URL = "http://localhost:8064";

export function useBridgeStatus() {
  return useQuery({
    queryKey: ["r64", "bridge", "health"],
    queryFn: async () => {
      try {
        const resp = await fetch(`${BRIDGE_URL}/api/health`);
        if (!resp.ok) throw new Error("Bridge unreachable");
        return { connected: true, ...(await resp.json()) };
      } catch {
        return { connected: false, status: "disconnected" };
      }
    },
    staleTime: 10_000,
    refetchInterval: 15_000,
    retry: false,
  });
}
