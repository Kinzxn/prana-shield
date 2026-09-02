import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("patches").first();
    if (existing) return "already_seeded";

    const now = Date.now();

    // --- Patches (patient body patches) ---
    const patchData = [
      {
        patchId: "P-001",
        patientId: "CRIB-A1",
        heartRate: 78,
        spo2: 97,
        skinTemp: 36.5,
        edaGsr: 4.2,
        baselineHR: { min: 60, max: 90 },
        baselineSpo2: { min: 94, max: 100 },
        baselineTemp: { min: 36.0, max: 37.2 },
        baselineEda: { min: 2.0, max: 8.0 },
        riskScore: 18,
        status: "normal" as const,
        riskHistory: Array.from({ length: 60 }, (_, i) =>
          Math.max(0, Math.min(100, 18 + Math.sin(i * 0.1) * 8 + (Math.random() - 0.5) * 6))
        ),
        physiologyWeight: 0.6,
        environmentWeight: 0.25,
        exposureDuration: 0.15,
      },
      {
        patchId: "P-002",
        patientId: "CRIB-A2",
        heartRate: 92,
        spo2: 95,
        skinTemp: 37.4,
        edaGsr: 12.1,
        baselineHR: { min: 65, max: 95 },
        baselineSpo2: { min: 93, max: 100 },
        baselineTemp: { min: 36.1, max: 37.3 },
        baselineEda: { min: 3.0, max: 10.0 },
        riskScore: 55,
        status: "elevated" as const,
        riskHistory: Array.from({ length: 60 }, (_, i) =>
          Math.max(0, Math.min(100, 35 + i * 0.35 + Math.sin(i * 0.15) * 10 + (Math.random() - 0.5) * 5))
        ),
        physiologyWeight: 0.55,
        environmentWeight: 0.3,
        exposureDuration: 0.15,
      },
      {
        patchId: "P-003",
        patientId: "CRIB-B1",
        heartRate: 112,
        spo2: 91,
        skinTemp: 38.8,
        edaGsr: 18.5,
        baselineHR: { min: 60, max: 88 },
        baselineSpo2: { min: 95, max: 100 },
        baselineTemp: { min: 36.0, max: 37.5 },
        baselineEda: { min: 2.0, max: 7.0 },
        riskScore: 82,
        status: "critical" as const,
        riskHistory: Array.from({ length: 60 }, (_, i) =>
          Math.max(0, Math.min(100, 40 + i * 0.7 + Math.sin(i * 0.12) * 5 + (Math.random() - 0.5) * 8))
        ),
        physiologyWeight: 0.65,
        environmentWeight: 0.2,
        exposureDuration: 0.15,
      },
      {
        patchId: "P-004",
        patientId: "CRIB-B2",
        heartRate: 85,
        spo2: 96,
        skinTemp: 36.9,
        edaGsr: 6.3,
        baselineHR: { min: 58, max: 92 },
        baselineSpo2: { min: 94, max: 100 },
        baselineTemp: { min: 35.8, max: 37.0 },
        baselineEda: { min: 2.5, max: 9.0 },
        riskScore: 32,
        status: "normal" as const,
        riskHistory: Array.from({ length: 60 }, (_, i) =>
          Math.max(0, Math.min(100, 30 + Math.sin(i * 0.08) * 12 + (Math.random() - 0.5) * 7))
        ),
        physiologyWeight: 0.5,
        environmentWeight: 0.3,
        exposureDuration: 0.2,
      },
      {
        patchId: "P-005",
        patientId: "CRIB-C1",
        heartRate: 104,
        spo2: 89,
        skinTemp: 39.2,
        edaGsr: 22.0,
        baselineHR: { min: 62, max: 90 },
        baselineSpo2: { min: 95, max: 100 },
        baselineTemp: { min: 36.2, max: 37.4 },
        baselineEda: { min: 2.0, max: 8.0 },
        riskScore: 91,
        status: "critical" as const,
        riskHistory: Array.from({ length: 60 }, (_, i) =>
          Math.max(0, Math.min(100, 64 + i * 0.45 + Math.sin(i * 0.1) * 4 + (Math.random() - 0.5) * 6))
        ),
        physiologyWeight: 0.55,
        environmentWeight: 0.25,
        exposureDuration: 0.2,
      },
      {
        patchId: "P-006",
        patientId: "CRIB-C2",
        heartRate: 88,
        spo2: 94,
        skinTemp: 37.1,
        edaGsr: 9.8,
        baselineHR: { min: 60, max: 90 },
        baselineSpo2: { min: 93, max: 100 },
        baselineTemp: { min: 36.0, max: 37.5 },
        baselineEda: { min: 3.0, max: 10.0 },
        riskScore: 68,
        status: "elevated" as const,
        riskHistory: Array.from({ length: 60 }, (_, i) =>
          Math.max(0, Math.min(100, 50 + Math.sin(i * 0.13) * 15 + (Math.random() - 0.5) * 8))
        ),
        physiologyWeight: 0.45,
        environmentWeight: 0.35,
        exposureDuration: 0.2,
      },
      {
        patchId: "P-007",
        patientId: "CRIB-D1",
        heartRate: 0,
        spo2: 0,
        skinTemp: 0,
        edaGsr: 0,
        baselineHR: { min: 60, max: 88 },
        baselineSpo2: { min: 94, max: 100 },
        baselineTemp: { min: 36.0, max: 37.2 },
        baselineEda: { min: 2.0, max: 8.0 },
        riskScore: 100,
        status: "offline" as const,
        riskHistory: Array.from({ length: 60 }, (_, i) =>
          i < 40
            ? Math.max(0, Math.min(100, 15 + Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 4))
            : 100
        ),
        physiologyWeight: 0.4,
        environmentWeight: 0.2,
        exposureDuration: 0.4,
      },
      {
        patchId: "P-008",
        patientId: "CRIB-D2",
        heartRate: 76,
        spo2: 98,
        skinTemp: 36.3,
        edaGsr: 3.1,
        baselineHR: { min: 58, max: 85 },
        baselineSpo2: { min: 95, max: 100 },
        baselineTemp: { min: 35.9, max: 37.1 },
        baselineEda: { min: 1.5, max: 7.0 },
        riskScore: 8,
        status: "normal" as const,
        riskHistory: Array.from({ length: 60 }, (_, i) =>
          Math.max(0, Math.min(100, 10 + Math.sin(i * 0.09) * 5 + (Math.random() - 0.5) * 3))
        ),
        physiologyWeight: 0.6,
        environmentWeight: 0.2,
        exposureDuration: 0.2,
      },
    ];

    for (const p of patchData) {
      await ctx.db.insert("patches", {
        ...p,
        lastUpdated: now,
      });
    }

    // --- Environmental Nodes ---
    const envData = [
      {
        nodeId: "ENV-WARD-A",
        temperature: 38.2,
        humidity: 72,
        pm25: 85,
        pm10: 142,
        pressure: 1008,
        co: 12,
        lastUpdated: now,
      },
      {
        nodeId: "ENV-WARD-B",
        temperature: 37.8,
        humidity: 68,
        pm25: 62,
        pm10: 110,
        pressure: 1009,
        co: 8,
        lastUpdated: now,
      },
      {
        nodeId: "ENV-WARD-C",
        temperature: 41.5,
        humidity: 80,
        pm25: 120,
        pm10: 210,
        pressure: 1005,
        co: 22,
        lastUpdated: now,
      },
      {
        nodeId: "ENV-WARD-D",
        temperature: 36.9,
        humidity: 65,
        pm25: 45,
        pm10: 88,
        pressure: 1011,
        co: 5,
        lastUpdated: now,
      },
    ];

    for (const e of envData) {
      await ctx.db.insert("environmentalNodes", e);
    }

    // --- Mesh Network Nodes ---
    const meshData = [
      { nodeId: "PATCH-P001", type: "patch" as const, label: "P-001", status: "online" as const, connections: ["HUB-A"], x: 120, y: 80 },
      { nodeId: "PATCH-P002", type: "patch" as const, label: "P-002", status: "online" as const, connections: ["HUB-A"], x: 120, y: 180 },
      { nodeId: "PATCH-P003", type: "patch" as const, label: "P-003", status: "online" as const, connections: ["HUB-B"], x: 120, y: 280 },
      { nodeId: "PATCH-P004", type: "patch" as const, label: "P-004", status: "online" as const, connections: ["HUB-B"], x: 120, y: 380 },
      { nodeId: "PATCH-P005", type: "patch" as const, label: "P-005", status: "online" as const, connections: ["HUB-C"], x: 120, y: 480 },
      { nodeId: "PATCH-P006", type: "patch" as const, label: "P-006", status: "online" as const, connections: ["HUB-C"], x: 120, y: 580 },
      { nodeId: "PATCH-P007", type: "patch" as const, label: "P-007", status: "offline" as const, connections: [], x: 120, y: 680 },
      { nodeId: "PATCH-P008", type: "patch" as const, label: "P-008", status: "online" as const, connections: ["HUB-D"], x: 120, y: 780 },

      { nodeId: "HUB-A", type: "hub" as const, label: "Hub A (Ward-A)", status: "online" as const, connections: ["PATCH-P001", "PATCH-P002", "REP-1", "REP-2"], x: 350, y: 130 },
      { nodeId: "HUB-B", type: "hub" as const, label: "Hub B (Ward-B)", status: "online" as const, connections: ["PATCH-P003", "PATCH-P004", "REP-1", "REP-3"], x: 350, y: 330 },
      { nodeId: "HUB-C", type: "hub" as const, label: "Hub C (Ward-C)", status: "online" as const, connections: ["PATCH-P005", "PATCH-P006", "REP-2", "REP-3"], x: 350, y: 530 },
      { nodeId: "HUB-D", type: "hub" as const, label: "Hub D (Ward-D)", status: "online" as const, connections: ["PATCH-P008", "REP-1"], x: 350, y: 730 },

      { nodeId: "REP-1", type: "repeater" as const, label: "LoRa Repeater 1", status: "online" as const, connections: ["HUB-A", "HUB-B", "HUB-D", "REP-2", "REP-3"], x: 580, y: 280 },
      { nodeId: "REP-2", type: "repeater" as const, label: "LoRa Repeater 2", status: "online" as const, connections: ["HUB-A", "HUB-C", "REP-1", "REP-3"], x: 580, y: 480 },
      { nodeId: "REP-3", type: "repeater" as const, label: "LoRa Repeater 3", status: "online" as const, connections: ["HUB-B", "HUB-C", "REP-1", "REP-2", "RESP-1"], x: 580, y: 680 },

      { nodeId: "RESP-1", type: "responder" as const, label: "Responder Endpoint", status: "online" as const, connections: ["REP-3"], x: 780, y: 480 },
    ];

    for (const m of meshData) {
      await ctx.db.insert("meshNodes", m);
    }

    // --- Alert Log ---
    const alerts = [
      { timestamp: now - 300000, type: "risk_escalation" as const, message: "CRIB-B1 risk elevated to 82 — tachycardia + hyperthermia detected", severity: "critical" as const, patchId: "P-003", read: true },
      { timestamp: now - 240000, type: "environment" as const, message: "Ward C PM2.5 exceeds 120 µg/m³ — air quality hazardous", severity: "critical" as const, read: true },
      { timestamp: now - 180000, type: "risk_escalation" as const, message: "CRIB-C1 risk climbing: 64→91 over 5 min — early warning triggered", severity: "critical" as const, patchId: "P-005", read: true },
      { timestamp: now - 120000, type: "dead_man_switch" as const, message: "CRIB-D1 heartbeat lost — patch unresponsive for 2 minutes", severity: "critical" as const, patchId: "P-007", read: false },
      { timestamp: now - 90000, type: "reroute" as const, message: "Mesh rerouting: HUB-B traffic via REP-1→REP-3 alternate path", severity: "warning" as const, read: false },
      { timestamp: now - 60000, type: "environment" as const, message: "Ward C heat index 46°C — heatwave conditions confirmed", severity: "critical" as const, read: false },
      { timestamp: now - 30000, type: "risk_escalation" as const, message: "CRIB-C2 risk elevated to 68 — elevated stress markers", severity: "warning" as const, patchId: "P-006", read: false },
      { timestamp: now - 10000, type: "system" as const, message: "LoRa mesh self-test complete — 7/8 patches responsive", severity: "info" as const, read: false },
    ];

    for (const a of alerts) {
      await ctx.db.insert("alertLog", a);
    }

    return "seeded";
  },
});
