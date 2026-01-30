import { internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { query } from "./_generated/server";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAdminByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("admin")
      .filter((q) => q.eq(q.field("email"), email))
      .first();
  },
});

export const createOrganisation = internalMutation({
  args: {
    organisation_name: v.string(),
  },

  handler: async (ctx, args) => {
    return await ctx.db.insert("organisation", {
      organisation_name: args.organisation_name,
    });
  },
});

/* ---------------- CREATE ADMIN ---------------- */

export const createAdmin = internalMutation({
  args: {
    userId: v.id("users"),                 // <— new
    organisation_id: v.id("organisation"),
    admin_name: v.string(),
    email: v.string(),
    password_hash: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("admin", {
      userId: args.userId,
      organisation_id: args.organisation_id,
      admin_name: args.admin_name,
      email: args.email,
      password_hash: args.password_hash,
    });
  },
});
// convex/admin.ts


export const signupAdminRecord = mutation({
  args: {
    organisation_name: v.string(),
    admin_name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const organisationId = await ctx.db.insert("organisation", {
      organisation_name: args.organisation_name,
    });

    await ctx.db.insert("admin", {
      userId, // reference Convex Auth user
      organisation_id: organisationId,
      admin_name: args.admin_name,
      email: args.email,
      password_hash: args.password, // ideally a hash
    });

    return true;
  },
});



/* ---------- CURRENT ADMIN QUERY (DISPLAY ONLY NAME + EMAIL) ---------- */



export const getCurrentAdmin = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    console.log(`userID:${userId}`)
    if (userId === null) return null;
    
    const admin = await ctx.db
    .query("admin")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
    
    console.log(`adminID:${userId}`)
    if (!admin) return null;
    
    const organisation = await ctx.db.get(admin.organisation_id);
    console.log(`orgID:${userId}`)

    return {
      _id: admin._id,
      admin_name: admin.admin_name,
      email: admin.email,
      organisation_name: organisation?.organisation_name ?? null,
    };
  },
});




