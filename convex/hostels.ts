import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { query } from "./_generated/server";
export const createHostel = mutation({
  args: {
    hostel_name: v.string(),
    hostel_type: v.union(v.literal("boys"), v.literal("girls")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("hostel", {
      hostel_name: args.hostel_name,
      hostel_type: args.hostel_type,
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


export const getHostels = query({
  handler: async (ctx) => {
    return await ctx.db.query("hostel").collect();
  },
});

export const updateHostel = mutation({
  args: {
    id: v.id("hostel"),
    hostel_name: v.string(),
    hostel_type: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      hostel_name: args.hostel_name,
      hostel_type: args.hostel_type,
    });
  },
});

export const deleteHostel = mutation({
  args: { id: v.id("hostel") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
