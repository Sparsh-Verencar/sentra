// convex/blocks.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to fetch all blocks
export const getBlocks = query({
  handler: async (ctx) => {
    return await ctx.db.query("block").collect();
  },
});

// Mutation to create a block
export const createBlock = mutation({
  args: {
    blockName: v.string(),
    hostelId: v.id("hostel"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("block", {
      block_name: args.blockName,
      hostel_id: args.hostelId,
    });
  },
});
export const getBlocksByHostel = query({
  args: {
    hostelId: v.id("hostel"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("block")
      .filter((q) => q.eq(q.field("hostel_id"), args.hostelId))
      .collect();
  },
});