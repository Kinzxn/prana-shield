import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("patches").collect();
  },
});

export const getByPatchId = query({
  args: { patchId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("patches")
      .withIndex("by_patchId", (q) => q.eq("patchId", args.patchId))
      .first();
  },
});

export const simulateUpdate = mutation({
  args: {},
  handler: async (ctx) => {
    const patches = await ctx.db.query("patches").collect();
    const now = Date.now();

    for (const p of patches) {
      if (p.status === "offline") continue;

      const jitter = () => (Math.random() - 0.5) * 2;

      const newHR = Math.max(40, Math.min(160, p.heartRate + jitter() * 4 + (p.riskScore > 70 ? 1.5 : 0)));
      const newSpo2 = Math.max(70, Math.min(100, p.spo2 + jitter() * 0.5 + (p.riskScore > 70 ? -0.3 : 0)));
      const newTemp = Math.max(34, Math.min(42, p.skinTemp + jitter() * 0.15 + (p.riskScore > 70 ? 0.05 : 0)));
      const newEda = Math.max(0, Math.min(35, p.edaGsr + jitter() * 1.2 + (p.riskScore > 70 ? 0.4 : 0)));

      // Risk score drift — higher patches drift up faster
      const drift = p.riskScore > 70
        ? (Math.random() - 0.2) * 3
        : p.riskScore > 40
        ? (Math.random() - 0.4) * 2.5
        : (Math.random() - 0.5) * 2;

      let newRisk = Math.max(0, Math.min(100, p.riskScore + drift));

      let newStatus: "normal" | "elevated" | "critical" = "normal";
      if (newRisk > 70) newStatus = "critical";
      else if (newRisk > 40) newStatus = "elevated";

      const newHistory = [...p.riskHistory.slice(1), newRisk];

      const envFactors = 0.3 + Math.random() * 0.15;
      const physioFactors = 1 - envFactors - p.exposureDuration;

      await ctx.db.patch(p._id, {
        heartRate: Math.round(newHR * 10) / 10,
        spo2: Math.round(newSpo2 * 10) / 10,
        skinTemp: Math.round(newTemp * 100) / 100,
        edaGsr: Math.round(newEda * 10) / 10,
        riskScore: Math.round(newRisk),
        status: newStatus,
        riskHistory: newHistory,
        physiologyWeight: Math.round(physioFactors * 100) / 100,
        environmentWeight: Math.round(envFactors * 100) / 100,
        lastUpdated: now,
      });

      // Create alert on significant escalation
      if (newRisk > 75 && p.riskScore <= 75) {
        await ctx.db.insert("alertLog", {
          timestamp: now,
          type: "risk_escalation",
          message: `${p.patientId} risk escalated to ${Math.round(newRisk)} — intervention recommended`,
          severity: "critical",
          patchId: p.patchId,
          read: false,
        });
      } else if (newRisk > 45 && p.riskScore <= 45) {
        await ctx.db.insert("alertLog", {
          timestamp: now,
          type: "risk_escalation",
          message: `${p.patientId} risk elevated to ${Math.round(newRisk)} — monitoring increased`,
          severity: "warning",
          patchId: p.patchId,
          read: false,
        });
      }
    }

    return "updated";
  },
});

export const simulateDeadManSwitch = mutation({
  args: { patchId: v.string() },
  handler: async (ctx, args) => {
    const patch = await ctx.db
      .query("patches")
      .withIndex("by_patchId", (q) => q.eq("patchId", args.patchId))
      .first();
    if (!patch) return "not_found";

    const now = Date.now();
    await ctx.db.patch(patch._id, {
      heartRate: 0,
      spo2: 0,
      skinTemp: 0,
      edaGsr: 0,
      riskScore: 100,
      status: "offline",
      lastUpdated: now,
    });

    // Update mesh node status
    const meshNode = await ctx.db
      .query("meshNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", `PATCH-${args.patchId}`))
      .first();
    if (meshNode) {
      await ctx.db.patch(meshNode._id, { status: "offline" });
    }

    await ctx.db.insert("alertLog", {
      timestamp: now,
      type: "dead_man_switch",
      message: `${patch.patientId} heartbeat lost — dead-man's switch triggered, patch unresponsive`,
      severity: "critical",
      patchId: args.patchId,
      read: false,
    });

    return "triggered";
  },
});
