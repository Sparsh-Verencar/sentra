import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

/* ======================================================
   ADD STUDENT
====================================================== */

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
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not authenticated");

    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");

    const block = await ctx.db.get(room.block_id);
    if (!block) throw new Error("Block not found");

    const hostel = await ctx.db.get(block.hostel_id);
    if (!hostel) throw new Error("Hostel not found");

    if (hostel.hostel_type === "Boys" && args.gender !== "male") {
      throw new Error("Boys hostel allows only male students");
    }

    if (hostel.hostel_type === "Girls" && args.gender !== "female") {
      throw new Error("Girls hostel allows only female students");
    }

    const existing = await ctx.db
      .query("student")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existing) {
      throw new Error("Student with this email already exists");
    }

    const studentsInRoom = await ctx.db
      .query("student")
      .filter((q) =>
        q.eq(q.field("room_id"), args.roomId)
      )
      .collect();

    if (studentsInRoom.length >= room.capacity) {
      throw new Error("Room capacity full");
    }

    return await ctx.db.insert("student", {
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
      userId,
    });
  },
});

/* ======================================================
   GET STUDENTS BY ROOM
====================================================== */

export const getStudentsByRoom = query({
  args: {
    roomId: v.id("room"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("student")
      .filter((q) =>
        q.eq(q.field("room_id"), args.roomId)
      )
      .collect();
  },
});

/* ======================================================
   GET STUDENT BY EMAIL
====================================================== */

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("student")
      .filter((q) =>
        q.eq(q.field("email"), args.email)
      )
      .first();
  },
});

/* ======================================================
   STUDENT LOGIN
====================================================== */

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
      return { success: false, message: "Student not found" };
    }

    const match = await ctx.runAction(
      api.authActions.comparePassword,
      {
        password: args.password,
        hashedPassword: student.student_password,
      }
    );

    if (!match) {
      return { success: false, message: "Invalid password" };
    }

    return {
      success: true,
      message: "Student login successful ✅",
    };
  },
});

/* ======================================================
   DELETE STUDENT
====================================================== */

export const deleteStudent = mutation({
  args: {
    studentId: v.id("student"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.studentId);
  },
});

/* ======================================================
   UPDATE STUDENT DETAILS
====================================================== */

export const updateStudentDetails = mutation({
  args: {
    studentId: v.id("student"),
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

/* ======================================================
   CURRENT LOGGED-IN STUDENT
====================================================== */

export const getCurrentStudent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;

    return await ctx.db
      .query("student")
      .withIndex("by_userId", (q) =>
        q.eq("userId", userId)
      )
      .first();
  },
});

/* ======================================================
   ROOM OCCUPANCY COUNTS
====================================================== */

export const getStudentCountByRooms = query({
  args: {
    blockId: v.id("block"),
  },

  handler: async (ctx, args) => {
    const rooms = await ctx.db
      .query("room")
      .withIndex("by_block", (q) =>
        q.eq("block_id", args.blockId)
      )
      .collect();

    const counts: Record<string, number> = {};

    for (const room of rooms) {
      const students = await ctx.db
        .query("student")
        .filter((q) =>
          q.eq(q.field("room_id"), room._id)
        )
        .collect();

      counts[room._id] = students.length;
    }

    return counts;
  },
});

/* ======================================================
   TRANSFER STUDENT ROOM
====================================================== */

export const transferStudentRoom = mutation({
  args: {
    studentId: v.id("student"),
    newRoomId: v.id("room"),
  },

  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) throw new Error("Student not found");

    const room = await ctx.db.get(args.newRoomId);
    if (!room) throw new Error("Room not found");

    const block = await ctx.db.get(room.block_id);
    if (!block) throw new Error("Block not found");

    const hostel = await ctx.db.get(block.hostel_id);
    if (!hostel) throw new Error("Hostel not found");

    if (hostel.hostel_type === "Boys" && student.gender !== "male") {
      throw new Error("Cannot move female student to boys hostel");
    }

    if (hostel.hostel_type === "Girls" && student.gender !== "female") {
      throw new Error("Cannot move male student to girls hostel");
    }

    const studentsInRoom = await ctx.db
      .query("student")
      .filter((q) =>
        q.eq(q.field("room_id"), args.newRoomId)
      )
      .collect();

    if (studentsInRoom.length >= room.capacity) {
      throw new Error("Target room is full");
    }

    await ctx.db.patch(args.studentId, {
      room_id: args.newRoomId,
    });

    return { success: true };
  },
});
