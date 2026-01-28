

import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api} from "./_generated/api";
/* ---------------- ADD STUDENT ---------------- */

export const addStudent = mutation({
  args: {
    fname: v.string(),
    lname: v.string(),
    date_of_birth: v.string(),
    gender: v.string(),
    dept_name: v.string(),
    year_of_study: v.string(),
    phone: v.number(),
    email: v.string(),
    address: v.string(),

    roomId: v.id("room"),

    student_password: v.string(), // ✅ already hashed from frontend
  },

  handler: async (ctx, args) => {
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

      student_password: args.student_password, // ✅ store directly
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
    // 1. Load staff via query from the action
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