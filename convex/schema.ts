import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

// The schema is normally optional, but Convex Auth
// requires indexes defined on `authTables`.
// The schema provides more precise TypeScript types.
export default defineSchema({
  ...authTables,
  numbers: defineTable({
    value: v.number(),
  }),
  student:defineTable({
    fname:v.string(),
    lname:v.string(),
    date_of_birth:v.string(),
    gender:v.string(),
    dept_name:v.string(),
    year_of_study:v.string(),
    phone:v.number(),
    email:v.string(),
    address:v.string(),
    room_id:v.id("room")
  }),
 room: defineTable({
    room_no: v.string(),
    capacity: v.number(),
    block_id: v.id("block"),
  }).index("by_block", ["block_id"]),
  block: defineTable({
    block_name: v.string(),
    hostel_id: v.id("hostel"),
  }).index("by_hostel", ["hostel_id"]),
  hostel:defineTable({
    hostel_name:v.string(),
    hostel_type:v.string(),
  }),
  management_staff:defineTable({
    hostel_id:v.id("hostel"),
    role:v.string(),
    fname:v.string(),
    lname:v.string(),
    gender:v.string(),
    phone:v.number(),
    email:v.string(),
    address:v.string(),
    role_id:v.id("role")
  }),
  announcement:defineTable({
    staff_id:v.id("management_staff"),
    title:v.string(),
    description:v.string(),
    tags:v.string(),
    date:v.string( ),
  }),
  role:defineTable({
    role_name:v.string(),
    permission_id:v.id("permissions"),
  }),
  permissions:defineTable({
    permission:v.string(),
  }),
  complaint:defineTable({
    complaint_type:v.string(),
    description:v.string(),
    priority:v.string(),
    status:v.string(),
    visibility:v.string(),
  }),
  resolves: defineTable({
  complaint_id: v.id("complaint"),
  staff_id: v.id("management_staff"),
  resolved_date: v.number(),
})
  .index("by_complaint", ["complaint_id"])
  .index("by_staff", ["staff_id"]),

  issues:defineTable({
    student_id:v.id("student"),
    complaint_id:v.id("complaint"),
    assigned_to:v.string(),
    issue_date:v.string(),
  }),
  lost_item:defineTable({
    item_name:v.string(),
    description:v.string(),
    status:v.string(),
  }),
  found:defineTable({
    student_id:v.id("student"),
    item_id:v.id("lost_item"),
    found_date:v.string(),
  }),
  lost:defineTable({
    student_id:v.id("student"),
    item_id:v.id("lost_item"),
    lost_date:v.string(),
  }),
});
