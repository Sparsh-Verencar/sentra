import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const markItemFound = mutation({
  args: {
    student_id: v.id("student"),
    item_id: v.id("lost_item"),
    found_date: v.string(),
  },
  handler: async ({ db }, { student_id, item_id, found_date }) => {
    const alreadyFound = await db
      .query("found")
      .filter((q) => q.eq(q.field("item_id"), item_id))
      .first();

    if (alreadyFound) return;

    await db.insert("found", {
      student_id,
      item_id,
      found_date,
    });

    await db.patch("lost_item", item_id, {
      status: "found",
    });
  },
});