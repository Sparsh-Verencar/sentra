"use client";

import { useState } from "react";
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
  const [selectedTag, setSelectedTag] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!announcements) {
    return <div className="p-4">Loading announcements...</div>;
  }

  const filteredAnnouncements =
    selectedTag === "all"
      ? announcements
      : announcements.filter((a) =>
        a.tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .includes(selectedTag.toLowerCase())
      );

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Select onValueChange={(value) => setSelectedTag(value)}>
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
        {filteredAnnouncements.length === 0 && (
          <p className="text-muted-foreground">No announcements for now.</p>
        )}

        {filteredAnnouncements.map((item) => {
          const isExpanded = expandedId === item._id;

          return (
            <Card
              key={item._id}
              onClick={() => toggleExpand(item._id)}
              className="cursor-pointer flex flex-col"
            >
              <CardHeader className="flex justify-between items-center">
                {/* Title on the left */}
                <CardTitle className="text-lg">{item.title}</CardTitle>

                {/* Date on the right */}
                <span className="text-sm text-white/70">{item.date}</span>
              </CardHeader>


              <CardContent className="flex flex-col justify-center">
                {/* Description container with height animation */}
                <div
                  className={`transition-[max-height,opacity] duration-500 ease-in-out overflow-hidden ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  style={{ minHeight: isExpanded ? undefined : 0 }}
                >
                  <p className="text-white">{item.description}</p>
                </div>

                {/* Tags always at bottom */}
                <div className="flex flex-wrap gap-2 mt-auto pt-4">
                  {item.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-white border-white"
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
