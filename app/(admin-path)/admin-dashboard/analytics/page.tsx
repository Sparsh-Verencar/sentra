"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const data = useQuery(api.analytics.getAnalytics);

  if (!data) return null;

  const staffChart = Object.entries(data.staffByRole).map(
    ([role, count]) => ({
      role,
      count,
    })
  );

  return (
    <div className="p-6 space-y-8">

      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      {/* ================= TOP METRICS ================= */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric title="Total Complaints" value={data.complaints.total} />
        <Metric title="Issued" value={data.complaints.issued} />
        <Metric title="In Progress" value={data.complaints.in_progress} />
        <Metric title="Completed" value={data.complaints.completed} />
      </div>

      {/* ================= INFRA ================= */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric title="Hostels" value={data.totalHostels} />
        <Metric title="Blocks" value={data.totalBlocks} />
        <Metric title="Rooms" value={data.totalRooms} />
        <Metric title="Students" value={data.totalStudents} />
      </div>

      {/* ================= CHART ================= */}

      <Card>
        <CardHeader>
          <CardTitle>Staff Distribution by Role</CardTitle>
        </CardHeader>

        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={staffChart}>
              <XAxis dataKey="role" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ================= INSIGHTS ================= */}

      <div className="grid md:grid-cols-2 gap-6">
        <Insight
          title="Most Problematic Hostel"
          value={data.mostProblematicHostel}
        />

        <Insight
          title="Most Common Complaint"
          value={data.mostCommonIssue}
        />
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-2xl font-bold">{value}</div>
      </CardHeader>
    </Card>
  );
}

function Insight({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-xl font-semibold">{value}</div>
      </CardHeader>
    </Card>
  );
}
