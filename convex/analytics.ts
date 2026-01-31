import { query } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

export const getAnalytics = query({
  args: {},

  handler: async (ctx) => {
    const complaints = await ctx.db.query("complaint").collect();
    const students = await ctx.db.query("student").collect();
    const staff = await ctx.db.query("management_staff").collect();
    const roles = await ctx.db.query("role").collect();
    const hostels = await ctx.db.query("hostel").collect();
    const blocks = await ctx.db.query("block").collect();
    const rooms = await ctx.db.query("room").collect();
    const issues = await ctx.db.query("issues").collect();

    /* ================= COMPLAINT STATS ================= */

    const complaintStatus = {
      total: complaints.length,
      issued: complaints.filter(c => c.status === "issued").length,
      in_progress: complaints.filter(c => c.status === "in_progress").length,
      completed: complaints.filter(c => c.status === "completed").length,
    };

    const complaintTypeCount: Record<string, number> = {};
    complaints.forEach(c => {
      complaintTypeCount[c.complaint_type] =
        (complaintTypeCount[c.complaint_type] || 0) + 1;
    });

    const mostCommonIssue =
      Object.entries(complaintTypeCount).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "None";

    /* ================= STAFF BY ROLE ================= */

    const staffByRole: Record<string, number> = {};

    staff.forEach(s => {
      const role = roles.find(r => r._id === s.role_id);
      if (!role) return;

      staffByRole[role.role_name] =
        (staffByRole[role.role_name] || 0) + 1;
    });

    /* ================= HOSTEL ISSUE COUNT ================= */

    const hostelIssueCount: Record<string, number> = {};

    for (const issue of issues) {
      const student = students.find(s => s._id === issue.student_id);
      if (!student) continue;

      const room = rooms.find(r => r._id === student.room_id);
      if (!room) continue;

      const block = blocks.find(b => b._id === room.block_id);
      if (!block) continue;

      const hostel = hostels.find(h => h._id === block.hostel_id);
      if (!hostel) continue;

      hostelIssueCount[hostel.hostel_name] =
        (hostelIssueCount[hostel.hostel_name] || 0) + 1;
    }

    const mostProblematicHostel =
      Object.entries(hostelIssueCount).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "None";

    return {
      complaints: complaintStatus,
      totalStudents: students.length,
      totalStaff: staff.length,
      totalHostels: hostels.length,
      totalBlocks: blocks.length,
      totalRooms: rooms.length,
      staffByRole,
      mostProblematicHostel,
      mostCommonIssue,
    };
  },
});
