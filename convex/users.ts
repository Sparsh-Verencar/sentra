import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getAdmin = query({
   handler(ctx) {
        const adminId = getAuthUserId(ctx)
        if (!adminId) return null
        const admin_details = ctx.db
        .query("management_staff")
        .filter((q)=>q.eq(q.field("role_id"),adminId as any))
        .first()
        return admin_details
   },
  },
)
