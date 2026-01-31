import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api} from "./_generated/api";

export const getAllStaff = query({
  handler: async (ctx) => {
    return await ctx.db.query("management_staff").collect()
  },
})

export const getAllRoles = query({
  handler: async (ctx) => {
    return await ctx.db.query("role").collect()
  },
})

export const getAllHostels = query({
  handler: async (ctx) => {
    return await ctx.db.query("hostel").collect()
  },
})


export const createStaff = mutation({
  args: {
    fname: v.string(),
    lname: v.string(),
    gender: v.string(),
    phone: v.number(),
    email: v.string(),
    address: v.string(),
    hostel_id: v.id("hostel"),
    role_id: v.id("role"),
     staff_password: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("management_staff", args)
    return id
  },
})

export const deleteStaff = mutation({
  args: { id: v.id("management_staff") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id)
    return id
  },
})


export const updateStaff = mutation({
  args: {
    id: v.id("management_staff"),
    fname: v.string(),
    lname: v.string(),
    gender: v.string(),
    phone: v.number(),
    email: v.string(),
    address: v.string(),
    hostel_id: v.id("hostel"),
    role_id: v.id("role"),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, updates)
    return id
  },
})

export const addStaff = mutation({
  args: {
    hostel_id: v.id("hostel"),
    role_id: v.id("role"),

    fname: v.string(),
    lname: v.string(),
    gender: v.string(),

    phone: v.number(),
    email: v.string(),
    address: v.string(),

    staff_password: v.string(), // ✅ already hashed from frontend
  },

  handler: async (ctx, args) => {
    const roleDoc = await ctx.db.get(args.role_id);

    await ctx.db.insert("management_staff", {
      hostel_id: args.hostel_id,
      role_id: args.role_id,
      fname: args.fname,
      lname: args.lname,
      gender: args.gender,
      phone: args.phone,
      email: args.email,
      address: args.address,

      staff_password: args.staff_password, // ✅ store directly
    });
  },
});


/* ---------------- GET STAFF LIST ---------------- */

export const getStaff = query({
  handler: async (ctx) => {
    const staff = await ctx.db.query("management_staff").collect();

    // Populate hostel + role names
    const populated = await Promise.all(
      staff.map(async (s) => {
        const hostel = await ctx.db.get(s.hostel_id);
        const role = await ctx.db.get(s.role_id);

        return {
          ...s,
          hostelType: hostel?.hostel_type ?? "Unknown",
          roleName: role?.role_name ?? "Unknown",
        };
      })
    );

    return populated;
  },
});
export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("management_staff")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
  },
});

/* ---------------- LOGIN STAFF (ACTION) ---------------- */

export const loginStaff = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Find staff by email
    const staff = await ctx.runQuery(api.staff.getByEmail, {
      email: args.email,
    });

    if (!staff) {
      return { success: false, message: "Staff not found" };
    }

    // 2. Compare passwords directly (no hash)
    if (staff.staff_password !== args.password) {
      return { success: false, message: "Invalid password" };
    }

    return { success: true, message: "Staff login successful ✅" };
  },
});
