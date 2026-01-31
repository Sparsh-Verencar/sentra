"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcryptjs";

/* ---------------- HASH PASSWORD ---------------- */

export const hashPassword = action({
  args: {
    password: v.string(),
  },

  handler: async (_, args) => {
    const hashed = await bcrypt.hash(args.password, 10);
    return hashed;
  },
});

/* ---------------- COMPARE PASSWORD ---------------- */

export const comparePassword = action({
  args: {
    password: v.string(),
    hashedPassword: v.string(),
  },

  handler: async (_, args) => {
    const match = await bcrypt.compare(
      args.password,
      args.hashedPassword
    );

    return match;
  },
});
