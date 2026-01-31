import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";

/* ============================================================
   INTERNAL HELPER — DETERMINE USER ROLE
============================================================ */


export const getCurrentUserRole = query({
  args: {},

  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    /* ================= ADMIN CHECK ================= */

    const admins =
      (await ctx.db.query("admin").collect()) as Doc<"admin">[];

    const admin = admins.find(
      (a) => a.userId === userId
    );

    if (admin) {
      return {
        isAdmin: true,
        roleId: null,
        roleName: "admin",
      };
    }

    /* ================= STAFF CHECK ================= */

    // get auth email
    const identity = await ctx.auth.getUserIdentity();

    if (!identity?.email) {
      throw new Error("Email not found in auth identity");
    }

    const staffList =
      (await ctx.db
        .query("management_staff")
        .collect()) as Doc<"management_staff">[];

    const staff = staffList.find(
      (s) => s.email === identity.email
    );

    if (!staff) {
      return {
        isAdmin: false,
        roleId: null,
        roleName: null,
      };
    }

    /* ================= ROLE NAME ================= */

    const role =
      (await ctx.db.get(staff.role_id)) as Doc<"role"> | null;

    return {
      isAdmin: false,
      roleId: staff.role_id,
      roleName: role?.role_name ?? null,
    };
  },
});


/* ============================================================
   GET COMPLAINTS FOR CURRENT USER
============================================================ */

export const getComplaintsForUser = query({
  args: {},

  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email;

    if (!email) return [];

    /* ---------------- ADMIN CHECK ---------------- */

    const admins =
      (await ctx.db.query("admin").collect()) as Doc<"admin">[];

    const isAdmin = admins.some((a) => a.email === email);

    const complaints =
      (await ctx.db.query("complaint").collect()) as Doc<"complaint">[];

    if (isAdmin) return complaints;

    /* ---------------- STAFF CHECK ---------------- */

    const staffList =
      (await ctx.db
        .query("management_staff")
        .collect()) as Doc<"management_staff">[];

    const staff = staffList.find(
      (s) => s.email === email
    );

    if (!staff) return [];

    // get role name
    const role = await ctx.db.get(staff.role_id);
    if (!role) return [];

    const roleName = role.role_name;

    /* ---------------- ISSUES FILTER ---------------- */

    const issues =
      (await ctx.db.query("issues").collect()) as Doc<"issues">[];

    const allowedComplaintIds = new Set(
      issues
        .filter((i) => i.assigned_to === roleName)
        .map((i) => i.complaint_id)
    );

    return complaints.filter((c) =>
      allowedComplaintIds.has(c._id)
    );
  },
});

/* ============================================================
   UPDATE COMPLAINT STATUS
============================================================ */

export const updateComplaintStatus = mutation({
  args: {
    complaintId: v.id("complaint"),
    status: v.union(
      v.literal("issued"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    // update complaint status
    await ctx.db.patch(args.complaintId, {
      status: args.status,
    });

    // only log resolve when completed
    if (args.status !== "completed") return;

    // get auth email
    const identity = await ctx.auth.getUserIdentity();

    if (!identity?.email) {
      throw new Error("No email in auth identity");
    }

    // find staff row
    const staffList =
      (await ctx.db
        .query("management_staff")
        .collect()) as Doc<"management_staff">[];

    const staff = staffList.find(
      (s) => s.email === identity.email
    );

    if (!staff) {
      throw new Error("Staff record not found");
    }

    // log resolve
    await ctx.db.insert("resolves", {
      complaint_id: args.complaintId,
      staff_id: staff._id,
      resolved_date: Date.now(),
    });
  },
});



