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

    const admin = admins.find((a) => a.userId === userId);

    if (admin) {
      return {
        isAdmin: true,
        roleId: null,
        roleName: "admin",
      };
    }

    /* ================= STAFF CHECK ================= */

    const identity = await ctx.auth.getUserIdentity();

    if (!identity?.email) {
      throw new Error("Email not found in auth identity");
    }

    const staffList =
      (await ctx.db
        .query("management_staff")
        .collect()) as Doc<"management_staff">[];

    const staff = staffList.find((s) => s.email === identity.email);

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

    // ---------- Admin: see all ----------
    const admin = await ctx.db
      .query("admin")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (admin) {
      const complaints = await ctx.db.query("complaint").collect();
      const issues = await ctx.db.query("issues").collect();
      const students = await ctx.db.query("student").collect();

      return complaints.map((c) => {
        const issue = issues.find((i) => i.complaint_id === c._id);
        const student = issue
          ? students.find((s) => s._id === issue.student_id)
          : null;

        return {
          ...c,
          student_name: student
            ? `${student.fname} ${student.lname}`
            : null,
          assigned_to: issue?.assigned_to ?? null,
        };
      });
    }

    // ---------- Student: see own + public ----------
    const student = await ctx.db
      .query("student")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (student) {
      const complaints = await ctx.db.query("complaint").collect();
      const issues = await ctx.db.query("issues").collect();

      // complaints linked to this student
      const myComplaintIds = new Set(
        issues
          .filter((i) => i.student_id === student._id)
          .map((i) => i.complaint_id),
      );

      // all issues to find owners
      const allStudents = await ctx.db.query("student").collect();

      const visible = complaints.filter((c) => {
        if (myComplaintIds.has(c._id)) return true; // own
        if (c.visibility === "public") return true; // public
        return false;
      });

      return visible.map((c) => {
        const issue = issues.find((i) => i.complaint_id === c._id);
        const owner = issue
          ? allStudents.find((s) => s._id === issue.student_id)
          : null;

        return {
          ...c,
          student_name: owner
            ? `${owner.fname} ${owner.lname}`
            : null,
          assigned_to: issue?.assigned_to ?? null,
        };
      });
    }

    // ---------- Staff: keep your existing logic ----------
    const identity = await ctx.auth.getUserIdentity();
    const email = identity?.email;
    if (!email) return [];

    const staff = await ctx.db
      .query("management_staff")
      .filter((q) => q.eq(q.field("email"), email))
      .first();
    if (!staff) return [];

    const role = await ctx.db.get(staff.role_id);
    if (!role) return [];

    const roleName = role.role_name;

    const issues = await ctx.db.query("issues").collect();
    const allowedComplaintIds = new Set(
      issues
        .filter((i) => i.assigned_to === roleName)
        .map((i) => i.complaint_id),
    );

    const complaints = await ctx.db.query("complaint").collect();
    const students = await ctx.db.query("student").collect();

    return complaints
      .filter((c) => allowedComplaintIds.has(c._id))
      .map((c) => {
        const issue = issues.find((i) => i.complaint_id === c._id);
        const student = issue
          ? students.find((s) => s._id === issue.student_id)
          : null;

        return {
          ...c,
          student_name: student
            ? `${student.fname} ${student.lname}`
            : null,
          assigned_to: issue?.assigned_to ?? null,
        };
      });
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

    const staff = staffList.find((s) => s.email === identity.email);

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

export const createStudentComplaint = mutation({
  args: {
    complaint_type: v.string(),
    description: v.string(),
    priority: v.string(),
    assigned_to: v.string(), // role name like "warden"
    visibility: v.optional(
      v.union(v.literal("private"), v.literal("public")),
    ),
  },

  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("Not authenticated");
    }

    /* ================= FIND STUDENT ================= */

    const student = await ctx.db
      .query("student")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (!student) {
      throw new Error("Student record not found");
    }

    /* ================= CREATE COMPLAINT ================= */

    const complaintId = await ctx.db.insert("complaint", {
      complaint_type: args.complaint_type,
      description: args.description,
      priority: args.priority,
      status: "issued",
      visibility: args.visibility ?? "private",
    });

    /* ================= LINK STUDENT IN ISSUES ================= */

    await ctx.db.insert("issues", {
      student_id: student._id,
      complaint_id: complaintId,
      assigned_to: args.assigned_to,
      issue_date: new Date().toISOString(),
    });

    return complaintId;
  },
});

/* ============================================================
   GET PUBLIC COMPLAINTS WITH FULL DETAILS
============================================================ */

// Get all public complaints with student name and assigned_to
export const getPublicComplaints = query({
  handler: async (ctx) => {
    // Get public complaints
    const complaints = await ctx.db
      .query("complaint")
      .filter((q) => q.eq(q.field("visibility"), "public"))
      .order("desc")
      .take(50); // Limit to last 50 complaints

    // Get all issues to link complaints with students and assignments
    const issues = await ctx.db.query("issues").collect();

    // Get all students to resolve names
    const students = await ctx.db.query("student").collect();

    // Map complaints with related data
    return complaints.map((complaint) => {
      // Find the issue record for this complaint
      const issue = issues.find((i) => i.complaint_id === complaint._id);

      // Find the student who made this complaint
      const student = issue
        ? students.find((s) => s._id === issue.student_id)
        : null;

      return {
        ...complaint,
        student_name: student
          ? `${student.fname} ${student.lname}`
          : "Anonymous",
        assigned_to: issue?.assigned_to ?? "Unassigned",
      };
    });
  },
});
