// convex/lostItem.ts
import { mutation ,query } from "./_generated/server";
import { v } from "convex/values";

export const createLostItemWithLost = mutation({
  args: {
    item_name: v.string(),
    description: v.string(),
    image_id: v.optional(v.id("_storage")),
    student_id: v.id("student"), // current student id
  },
  handler: async (ctx, { item_name, description, image_id, student_id }) => {
    // 1️⃣ Insert into lost_item
    const itemId = await ctx.db.insert("lost_item", {
      item_name,
      description,
      status: "lost",
      image_id,
    });

    // 2️⃣ Insert into lost table with current date
    const now = new Date().toISOString();
    await ctx.db.insert("lost", {
      student_id,
      item_id: itemId,
      lost_date: now,
    });

    return itemId; // optional
  },
});

// convex/lostItem.ts
export const getAllLostPosts = query({
  handler: async (ctx) => {
    const lostEntries = await ctx.db.query("lost").collect();

    return Promise.all(
      lostEntries.map(async (lost) => {
        const item = await ctx.db.get(lost.item_id);
        const student = await ctx.db.get(lost.student_id);

        const found = await ctx.db
          .query("found")
          .filter((q) => q.eq(q.field("item_id"), lost.item_id))
          .first();

        let foundWithStudent: null | {
          student: any;
          found_date: string;
        } = null;

        if (found) {
          const foundStudent = await ctx.db.get(found.student_id);
          foundWithStudent = {
            student: foundStudent!,
            found_date: found.found_date,
          };
        }

        return {
          _id: lost._id,
          date: lost.lost_date,
          item,
          student,
          found: foundWithStudent,
        };
      })
    );
  },
});