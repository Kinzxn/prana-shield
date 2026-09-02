import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  patches: defineTable({
    patchId: v.string(),
    patientId: v.string(),
    heartRate: v.number(),
    spo2: v.number(),
    skinTemp: v.number(),
    edaGsr: v.number(),
    baselineHR: v.object({ min: v.number(), max: v.number() }),
    baselineSpo2: v.object({ min: v.number(), max: v.number() }),
    baselineTemp: v.object({ min: v.number(), max: v.number() }),
    baselineEda: v.object({ min: v.number(), max: v.number() }),
    riskScore: v.number(),
    status: v.union(
      v.literal("normal"),
      v.literal("elevated"),
      v.literal("critical"),
      v.literal("offline")
    ),
    riskHistory: v.array(v.number()),
    physiologyWeight: v.number(),
    environmentWeight: v.number(),
    exposureDuration: v.number(),
    lastUpdated: v.number(),
  }).index("by_patchId", ["patchId"]),

  environmentalNodes: defineTable({
    nodeId: v.string(),
    temperature: v.number(),
    humidity: v.number(),
    pm25: v.number(),
    pm10: v.number(),
    pressure: v.number(),
    co: v.number(),
    lastUpdated: v.number(),
  }).index("by_nodeId", ["nodeId"]),

  meshNodes: defineTable({
    nodeId: v.string(),
    type: v.union(
      v.literal("patch"),
      v.literal("hub"),
      v.literal("repeater"),
      v.literal("responder")
    ),
    label: v.string(),
    status: v.union(
      v.literal("online"),
      v.literal("offline"),
      v.literal("rerouted")
    ),
    connections: v.array(v.string()),
    x: v.number(),
    y: v.number(),
  }).index("by_nodeId", ["nodeId"]),

  alertLog: defineTable({
    timestamp: v.number(),
    type: v.union(
      v.literal("risk_escalation"),
      v.literal("reroute"),
      v.literal("dead_man_switch"),
      v.literal("environment"),
      v.literal("system")
    ),
    message: v.string(),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("critical")
    ),
    patchId: v.optional(v.string()),
    read: v.boolean(),
  }).index("by_timestamp", ["timestamp"]),
});
