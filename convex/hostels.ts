import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { query } from "./_generated/server";
export const createHostel = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("boys"), v.literal("girls")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("hostel", {
      hostel_name: args.name,
      hostel_type: args.type,
    });
  },
});
export const getHostelTypes = query({
  handler: async (ctx) => {
    const hostels = await ctx.db.query("hostel").collect();

    // return only what the UI needs
    return hostels.map((h) => ({
      _id: h._id,
      hostel_type: h.hostel_type,
    }));
  },
});