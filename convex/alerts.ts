import { query, mutation } from "./_generated/server";

export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    const alerts = await ctx.db
      .query("alertLog")
      .withIndex("by_timestamp")
      .order("desc")
      .take(50);
    return alerts;
  },
});

export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("alertLog").collect();
    return all.filter((a) => !a.read).length;
  },
});

export const getActiveCriticalCount = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("alertLog").collect();
    const oneHourAgo = Date.now() - 3600000;
    return all.filter(
      (a) => a.severity === "critical" && a.timestamp > oneHourAgo
    ).length;
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("alertLog").collect();
    for (const a of all) {
      if (!a.read) {
        await ctx.db.patch(a._id, { read: true });
      }
    }
  },
});
