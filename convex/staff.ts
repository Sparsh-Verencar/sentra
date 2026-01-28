
import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api} from "./_generated/api";
/* ---------------- ADD STAFF ---------------- */

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

      role: roleDoc?.role_name ?? "Unknown",

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
    // 1. Load staff via query from the action
    const staff = await ctx.runQuery(api.staff.getByEmail, {
      email: args.email,
    });

    if (!staff) {
      return {
        success: false,
        message: "Staff not found",
      };
    }

    // 2. Compare password via Node action
    const match = await ctx.runAction(
      api.authActions.comparePassword,
      {
        password: args.password,
        hashedPassword: staff.staff_password,
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