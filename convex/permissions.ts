import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addPermission = mutation({
  args: {
    permission: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("permissions", {
      permission: args.permission,
    });
  },
});

export const getPermissions = query({
  handler: async (ctx) => {
    return await ctx.db.query("permissions").collect();
  },
});
