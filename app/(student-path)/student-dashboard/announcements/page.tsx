"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Announcements() {
  const announcements = useQuery(api.announcement.getForStudents);

  if (!announcements) {
    return <div className="p-4">Loading announcements...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="exam">Exam</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="important">Important</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Announcement Cards */}
      <div className="space-y-4">
        {announcements.length === 0 && (
          <p className="text-muted-foreground">No announcements yet.</p>
        )}

        {announcements.map((item) => (
          <Card key={item._id}>
            <CardHeader>
              <CardTitle className="text-lg">{item.title}</CardTitle>
            </CardHeader>

            <CardContent className="flex flex-wrap gap-2">
              {item.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
