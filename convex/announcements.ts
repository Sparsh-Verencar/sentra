import { mutation, query } from "./_generated/server";
import { v } from 'convex/values'

export const getAllAnnouncements = query({
    args: {},
    handler: async (ctx) => {
        const rows = await ctx.db.query("announcement").collect();
        return rows;
    },
});

export const createAnnouncement = mutation({
    args: {
        staff_id: v.id("management_staff"),
        title: v.string(),
        description: v.string(),
        tags: v.string(),
        date: v.string(),
    },
    handler: async(ctx, args)=> {
        const id = await ctx.db.insert("announcement", args);

        console.log("Added new document with id:", id);
    },
})

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
