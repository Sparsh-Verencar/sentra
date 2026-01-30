import { mutation, query } from "./_generated/server";
import { v } from 'convex/values'
import { getAuthUserId } from "@convex-dev/auth/server";
export const getAllAnnouncements = query({
    args: {},
    handler: async (ctx) => {
        const rows = await ctx.db.query("announcement").collect();
        return rows;
    },
});

export const createAnnouncement = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    tags: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // 1) Check if this user is an admin
    const admin = await ctx.db
      .query("admin")
      .withIndex("by_userId", q => q.eq("userId", userId))
      .first();

    // 2) Optionally, also check if this user is staff (if you add userId to management_staff)
    // const staff = await ctx.db
    //   .query("management_staff")
    //   .withIndex("by_userId", q => q.eq("userId", userId))
    //   .first();

    if (!admin /* && !staff */) {
      throw new Error("Not allowed to create announcements");
    }

    await ctx.db.insert("announcement", {
      userId,
      title: args.title,
      description: args.description,
      tags: args.tags,
      date: args.date,
    });
  },
});
export const deleteAnnouncement = mutation({
  args: { id: v.id("announcement") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
    return id
  },
})

export const updateAnnouncement = mutation({
  args: { id: v.id("announcement"), title: v.string(), description: v.string(), tags: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      description: args.description,
      tags: args.tags,
      date: args.date,
    })
    return args.id
  },
})
