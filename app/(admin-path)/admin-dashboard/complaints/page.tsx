"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Status = "issued" | "in_progress" | "completed";

export default function ComplaintsPage() {

  // TEMP (later derive from auth)
  const complaints = useQuery(
    api.complaints.getComplaintsForUser
  );

  const updateStatus = useMutation(
    api.complaints.updateComplaintStatus
  );


  const issued = complaints?.filter(c => c.status === "issued");
  const progress = complaints?.filter(c => c.status === "in_progress");
  const completed = complaints?.filter(c => c.status === "completed");

  return (
    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        Complaints Board
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <KanbanColumn
          title="Issued"
          items={issued}
          actionLabel="Start Progress"
          nextStatus="in_progress"
          onAction={updateStatus}
        />

        <KanbanColumn
          title="In Progress"
          items={progress}
          actionLabel="Mark Completed"
          nextStatus="completed"
          onAction={updateStatus}
        />

        <KanbanColumn
          title="Completed"
          items={completed}
        />

      </div>
    </div>
  );
}

/* ====================================================== */

function KanbanColumn({
  title,
  items,
  actionLabel,
  nextStatus,
  onAction,
}: {
  title: string;
  items?: any[];
  actionLabel?: string;
  nextStatus?: Status;
  onAction?: any;
}) {
  return (
    <div className="space-y-4">

      <h2 className="font-semibold text-lg">{title}</h2>
      <Separator />

      {items?.length ? (
        items.map((c) => (
          <Card key={c._id}>
            <CardHeader>
              <CardTitle className="text-base">
                {c.complaint_type}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {c.description}
              </p>

              <Badge variant="outline">
                Priority: {c.priority}
              </Badge>

              {actionLabel && nextStatus && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() =>
                    onAction({
                      complaintId: c._id,
                      status: nextStatus,
                    })
                  }
                >
                  {actionLabel}
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">
          No complaints
        </p>
      )}
    </div>
  );
}
