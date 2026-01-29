import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";


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
    role: v.string(),
    email: v.string(),
    phone: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, updates as any)
    return id
  },
})
