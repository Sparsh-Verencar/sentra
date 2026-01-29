// convex/rooms.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

export const createRoom = mutation({
  args: {
    roomNo: v.string(),
    capacity: v.number(),
    blockId: v.id("block"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("room", {
      room_no: args.roomNo,
      capacity: args.capacity,
      block_id: args.blockId,
    });
  },
});
// in /convex/queries/rooms.ts
export const getRoomsByBlock = query({
  args: {
    blockId: v.optional(v.id("block")),
    // or: blockId: v.union(v.id("block"), v.null()),
  },
  handler: async (ctx, { blockId }) => {
    if (!blockId) return [];
    return await ctx.db
      .query("room")
      .withIndex("by_block", (q) => q.eq("block_id", blockId))
      .collect();
  },
});

