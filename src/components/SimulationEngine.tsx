import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function SimulationEngine() {
  const simulatePatches = useMutation(api.patches.simulateUpdate);
  const simulateEnv = useMutation(api.environment.simulateUpdate);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Update every 2.5 seconds to mimic live telemetry
    intervalRef.current = setInterval(() => {
      simulatePatches();
      simulateEnv();
    }, 2500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [simulatePatches, simulateEnv]);

  return null;
}
