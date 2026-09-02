import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("meshNodes").collect();
  },
});

export const simulateHubDestruction = mutation({
  args: { nodeId: v.string() },
  handler: async (ctx, args) => {
    const hub = await ctx.db
      .query("meshNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .first();
    if (!hub || hub.type !== "hub") return "not_a_hub";

    const now = Date.now();
    await ctx.db.patch(hub._id, { status: "offline", connections: [] });

    // Reroute connected patches through surviving hubs
    const allNodes = await ctx.db.query("meshNodes").collect();
    const aliveHubs = allNodes.filter(
      (n) => n.type === "hub" && n.status === "online" && n.nodeId !== args.nodeId
    );

    // Find patches connected to destroyed hub
    const affectedPatches = allNodes.filter(
      (n) => n.type === "patch" && n.connections.includes(args.nodeId)
    );

    for (const patch of affectedPatches) {
      if (aliveHubs.length > 0) {
        const newHub = aliveHubs[Math.floor(Math.random() * aliveHubs.length)];
        await ctx.db.patch(patch._id, {
          status: "rerouted",
          connections: [newHub.nodeId],
        });
      } else {
        await ctx.db.patch(patch._id, {
          status: "offline",
          connections: [],
        });
      }
    }

    // Find repeaters and reroute
    const affectedRepeaters = allNodes.filter(
      (n) => n.type === "repeater" && n.connections.includes(args.nodeId)
    );
    for (const rep of affectedRepeaters) {
      const newConns = rep.connections.filter((c) => c !== args.nodeId);
      await ctx.db.patch(rep._id, {
        status: newConns.length > 0 ? "rerouted" : "offline",
        connections: newConns,
      });
    }

    await ctx.db.insert("alertLog", {
      timestamp: now,
      type: "reroute",
      message: `${hub.label} destroyed — mesh auto-rerouting ${affectedPatches.length} patches through surviving hubs`,
      severity: "critical",
      read: false,
    });

    return "rerouted";
  },
});

export const simulateRestoreHub = mutation({
  args: { nodeId: v.string() },
  handler: async (ctx, args) => {
    const hub = await ctx.db
      .query("meshNodes")
      .withIndex("by_nodeId", (q) => q.eq("nodeId", args.nodeId))
      .first();
    if (!hub) return "not_found";

    const now = Date.now();

    // Restore original connections
    const originalConnections: Record<string, string[]> = {
      "HUB-A": ["PATCH-P001", "PATCH-P002", "REP-1", "REP-2"],
      "HUB-B": ["PATCH-P003", "PATCH-P004", "REP-1", "REP-3"],
      "HUB-C": ["PATCH-P005", "PATCH-P006", "REP-2", "REP-3"],
      "HUB-D": ["PATCH-P008", "REP-1"],
    };

    await ctx.db.patch(hub._id, {
      status: "online",
      connections: originalConnections[args.nodeId] || [],
    });

    // Restore patches
    const allNodes = await ctx.db.query("meshNodes").collect();
    const patches = allNodes.filter(
      (n) => n.type === "patch" && n.connections.includes(args.nodeId)
    );
    for (const p of patches) {
      await ctx.db.patch(p._id, { status: "online", connections: [args.nodeId] });
    }

    // Restore repeaters
    const repeaters = allNodes.filter(
      (n) => n.type === "repeater" && !n.connections.includes(args.nodeId) && n.status !== "offline"
    );
    for (const r of repeaters) {
      if (!r.connections.includes(args.nodeId)) {
        await ctx.db.patch(r._id, {
          status: "online",
          connections: [...r.connections, args.nodeId],
        });
      }
    }

    await ctx.db.insert("alertLog", {
      timestamp: now,
      type: "system",
      message: `${hub.label} restored — mesh connectivity nominal`,
      severity: "info",
      read: false,
    });

    return "restored";
  },
});
