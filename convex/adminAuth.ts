"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";
import { internal } from "./_generated/api";

/* ---------------- HASH PASSWORD ---------------- */

export const hashPassword = action({
  args: {
    password: v.string(),
  },
  handler: async (_ctx, { password }) => {
    const hashed = await bcrypt.hash(password, 10);
    return hashed;
  },
});

/* ---------------- COMPARE PASSWORD ---------------- */

export const comparePassword = action({
  args: {
    password: v.string(),
    hashedPassword: v.string(),
  },
  handler: async (_ctx, { password, hashedPassword }) => {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  },
});

/* ---------------- LOGIN ADMIN ---------------- */

export const loginAdmin = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (
    ctx,
    { email, password }
  ): Promise<{ success: boolean; message: string }> => {
    const admin = await ctx.runQuery(internal.admin.getAdminByEmail, {
      email,
    });

    if (!admin) {
      return { success: false, message: "Admin not found" };
    }

    const match = await bcrypt.compare(password, admin.password_hash);

    if (!match) {
      return { success: false, message: "Invalid password" };
    }

    return {
      success: true,
      message: `Welcome Admin: ${admin.admin_name}`,
    };
  },
});

export const signupAdmin = action({
  args: {
    organisation_name: v.string(),
    admin_name: v.string(),
    email: v.string(),
    password: v.string(),
  },

  handler: async (ctx, args) => {
    /* ✅ Check if admin already exists */
    const existingAdmin = await ctx.runQuery(
      internal.admin.getAdminByEmail,
      {
        email: args.email,
      }
    );

    if (existingAdmin) {
      return {
        success: false,
        message: "Admin already exists with this email",
      };
    }

    /* ✅ Hash password */
    const hashedPassword = await bcrypt.hash(args.password, 10);

    /* ✅ Create organisation */
    const organisationId = await ctx.runMutation(
      internal.admin.createOrganisation,
      {
        organisation_name: args.organisation_name,
      }
    );

    /* ✅ Create admin */
    await ctx.runMutation(internal.admin.createAdmin, {
      organisation_id: organisationId,
      admin_name: args.admin_name,
      email: args.email,
      password_hash: hashedPassword,
    });

    return {
      success: true,
      message: "Admin Signup Successful ✅",
    };
  },
});



