import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addRole = mutation({
  args: {
    role_name: v.string(),
    permission_id: v.id("permissions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("role", {
      role_name: args.role_name,
      permission_id: args.permission_id,
    });
  },
});

export const getRoles = query({
  handler: async (ctx) => {
    const roles = await ctx.db.query("role").collect();

    // Populate permission name
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role) => {
        const permission = await ctx.db.get(role.permission_id);

        return {
          ...role,
          permissionName: permission?.permission ?? "Unknown",
        };
      })
    );

    return rolesWithPermissions;
  },
});
