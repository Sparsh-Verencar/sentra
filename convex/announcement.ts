import { query } from "./_generated/server";

export const getForStudents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("announcement")
      .order("desc")
      .collect();
  },
});
