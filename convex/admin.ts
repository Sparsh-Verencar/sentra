import { internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { query } from "./_generated/server";
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
    organisation_id: v.id("organisation"),
    admin_name: v.string(),
    email: v.string(),
    password_hash: v.string(),
  },

  handler: async (ctx, args) => {
    await ctx.db.insert("admin", {
      organisation_id: args.organisation_id,
      admin_name: args.admin_name,
      email: args.email,
      password_hash: args.password_hash,
    });
  },
});
export const getCurrentAdmin = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) return null;

    // 1. Get admin
    const admin = await ctx.db
      .query("admin")
      .filter((q) => q.eq(q.field("email"), identity.email))
      .first();

    if (!admin) return null;

    // 2. Get organisation using organisation_id
    const organisation = await ctx.db.get(admin.organisation_id);

    return {
      ...admin,
      organisation_name: organisation?.organisation_name ?? "Unknown",
    };
  },
});
