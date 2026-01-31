

import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api} from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { createAccount } from "@convex-dev/auth/server";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
/* ---------------- ADD STUDENT ---------------- */

export const addStudentInternal = internalMutation({
  args: {
    // same args as before, plus userId from createAccount
    fname: v.string(),
    lname: v.string(),
    date_of_birth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female")),
    dept_name: v.string(),
    year_of_study: v.string(),
    phone: v.number(),
    email: v.string(),
    address: v.string(),
    roomId: v.id("room"),
    student_password: v.string(),
    userId: v.id("users"), // or whatever your users table is
  },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    const block = await ctx.db.get(room.block_id);
    if (!block) throw new Error("Block not found");

    const hostel = await ctx.db.get(block.hostel_id);
    if (!hostel) throw new Error("Hostel not found");

    if (hostel.hostel_type === "Boys" && args.gender !== "male") {
      throw new Error("Boys hostel students must be Male");
    }
    if (hostel.hostel_type === "Girls" && args.gender !== "female") {
      throw new Error("Girls hostel students must be Female");
    }

    await ctx.db.insert("student", {
      fname: args.fname,
      lname: args.lname,
      date_of_birth: args.date_of_birth,
      gender: args.gender,
      dept_name: args.dept_name,
      year_of_study: args.year_of_study,
      phone: args.phone,
      email: args.email,
      address: args.address,
      room_id: args.roomId,
      student_password: args.student_password,
      userId: args.userId,
    });
  },
});

export const addStudent = action({
  args: {
    fname: v.string(),
    lname: v.string(),
    date_of_birth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female")),
    dept_name: v.string(),
    year_of_study: v.string(),
    phone: v.number(),
    email: v.string(),
    address: v.string(),
    roomId: v.id("room"),
    student_password: v.string(),
  },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Admin not authenticated");

    const result = await createAccount(ctx, {
      provider: "password",
      account: {
        id: args.email,
        secret: args.student_password,
      },
      profile: {
        email: args.email,
      },
    });

    const studentUserId = result.user._id;

    await ctx.runMutation(internal.students.addStudentInternal, {
      ...args,
      userId: studentUserId,
    });
  },
});


/* ---------------- GET STUDENTS BY ROOM ---------------- */

export const getStudentsByRoom = query({
  args: {
    roomId: v.id("room"),
  },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("student")
      .filter((q) => q.eq(q.field("room_id"), args.roomId))
      .collect();
  },
});
export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("student")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});
/* ---------------- LOGIN STUDENT (MUTATION) ---------------- */


export const loginStudent = action({
  args: {
    email: v.string(),
    password: v.string(),
  },

  handler: async (ctx, args) => {
   
    const student = await ctx.runQuery(api.students.getByEmail, {
      email: args.email,
    });

    if (!student) {
      return {
        success: false,
        message: "student not found",
      };
    }

    // 2. Compare password via Node action
    const match = await ctx.runAction(
      api.authActions.comparePassword,
      {
        password: args.password,
        hashedPassword: student.student_password,
      },
    );

    if (!match) {
      return {
        success: false,
        message: "Invalid password",
      };
    }

    return {
      success: true,
      message: "Staff login successful ✅",
    };
  },
});
//STUDENT DELETE


export const deleteStudent = mutation({
  args: {
    studentId: v.id("student"),
  },

  handler: async (ctx, args) => {
    // ✅ Admin must be logged in
    const adminId = await getAuthUserId(ctx);
    if (!adminId) throw new Error("Not authenticated");

    // ✅ Step 1: Get student record
    const student = await ctx.db.get(args.studentId);
    if (!student) throw new Error("Student not found");

    // ✅ Step 2: Extract userId
    const studentUserId = student.userId;
    if (!studentUserId) throw new Error("Student has no linked userId");

    /* ------------------------------------------------------ */
    /* ✅ DELETE EVERYTHING RELATED TO THIS USER ID             */
    /* ------------------------------------------------------ */

    // ✅ 1. Delete authAccounts
    const authAccounts = await ctx.db
      .query("authAccounts")
      .filter((q) => q.eq(q.field("userId"), studentUserId))
      .collect();

    for (const acc of authAccounts) {
      await ctx.db.delete(acc._id);
    }

    // ✅ 2. Delete authSessions
    const sessions = await ctx.db
      .query("authSessions")
      .filter((q) => q.eq(q.field("userId"), studentUserId))
      .collect();

    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }


   
   

    // ✅ 5. Delete user itself
    await ctx.db.delete(studentUserId);

    /* ------------------------------------------------------ */
    /* ✅ FINALLY DELETE STUDENT RECORD                         */
    /* ------------------------------------------------------ */

    await ctx.db.delete(args.studentId);

    return {
      success: true,
      message: "Student and all auth data deleted completely",
    };
  },
});




//UPDATE STUDENTS
export const updateStudentDetails = mutation({
  args: {
    studentId: v.id("student"),

    // ✅ Allowed editable fields only
    fname: v.string(),
    lname: v.string(),
    date_of_birth: v.string(),
    dept_name: v.string(),
    year_of_study: v.string(),
    phone: v.number(),
    address: v.string(),
  },

  handler: async (ctx, args) => {
    await ctx.db.patch(args.studentId, {
      fname: args.fname,
      lname: args.lname,
      date_of_birth: args.date_of_birth,
      dept_name: args.dept_name,
      year_of_study: args.year_of_study,
      phone: args.phone,
      address: args.address,
    });

    return { success: true };
  },
});

export const getCurrentStudent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    return await ctx.db
      .query("student")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
  },
});