// convex/room.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRoom = mutation({
  args: {
    room_no: v.string(),
    capacity: v.number(),
    block_id: v.id("block"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("room", args);
  },
});

export const getRoomsByBlock = query({
  args: { block_id: v.id("block") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("room")
      .withIndex("by_block", (q) =>
        q.eq("block_id", args.block_id)
      )
      .collect();
  },
});
