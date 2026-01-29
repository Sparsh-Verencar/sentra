

import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api} from "./_generated/api";
/* ---------------- ADD STUDENT ---------------- */

export const addStudent = mutation({
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
    // ✅ Fetch room
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    // ✅ Fetch block
    const block = await ctx.db.get(room.block_id);
    if (!block) throw new Error("Block not found");

    // ✅ Fetch hostel
    const hostel = await ctx.db.get(block.hostel_id);
    if (!hostel) throw new Error("Hostel not found");

    // ✅ Gender Validation
    if (hostel.hostel_type === "Boys" && args.gender !== "male") {
      throw new Error("Boys hostel students must be Male");
    }

    if (hostel.hostel_type === "Girls" && args.gender !== "female") {
      throw new Error("Girls hostel students must be Female");
    }

    const gender = args.gender.toLowerCase() as "male" | "female";
    // ✅ Insert Student
    await ctx.db.insert("student", {
      fname: args.fname,
      lname: args.lname,
      date_of_birth: args.date_of_birth,
      gender,
      dept_name: args.dept_name,
      year_of_study: args.year_of_study,
      phone: args.phone,
      email: args.email,
      address: args.address,
      room_id: args.roomId,
      student_password: args.student_password,
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
//STUDENT DELETE
export const deleteStudent = mutation({
  args: {
    studentId: v.id("student"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.studentId);
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