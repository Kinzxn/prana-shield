import { mutation, query } from "./_generated/server";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("environmentalNodes").collect();
  },
});

export const simulateUpdate = mutation({
  args: {},
  handler: async (ctx) => {
    const nodes = await ctx.db.query("environmentalNodes").collect();
    const now = Date.now();

    for (const n of nodes) {
      const jitter = () => (Math.random() - 0.5);
      await ctx.db.patch(n._id, {
        temperature: Math.round((n.temperature + jitter() * 0.4) * 10) / 10,
        humidity: Math.max(20, Math.min(100, Math.round((n.humidity + jitter() * 1.5) * 10) / 10)),
        pm25: Math.max(0, Math.round(n.pm25 + jitter() * 5)),
        pm10: Math.max(0, Math.round(n.pm10 + jitter() * 8)),
        pressure: Math.round((n.pressure + jitter() * 0.3) * 10) / 10,
        co: Math.max(0, Math.round((n.co + jitter() * 0.8) * 10) / 10),
        lastUpdated: now,
      });
    }

    return "updated";
  },
});
