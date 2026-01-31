"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Users,
  Lock,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function StudentComplaintPage() {
  const createComplaint = useMutation(api.complaints.createStudentComplaint);

  // Fetch public complaints for display
  const publicComplaints = useQuery(api.complaints.getPublicComplaints);

  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [type, setType] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("high");
  const [assignedTo, setAssignedTo] = useState("warden");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!type.trim()) {
      newErrors.type = "Complaint type is required";
    }

    if (!desc.trim()) {
      newErrors.desc = "Description is required";
    } else if (desc.trim().length < 10) {
      newErrors.desc = "Description must be at least 10 characters";
    }

    if (!assignedTo.trim()) {
      newErrors.assignedTo = "Please specify who to assign this to";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit() {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      await createComplaint({
        complaint_type: type,
        description: desc,
        priority,
        assigned_to: assignedTo,
        visibility,
      });

      toast.success(
        visibility === "public"
          ? "✅ Public complaint submitted!"
          : "✅ Private complaint submitted!"
      );

      // Reset form
      setType("");
      setDesc("");
      setPriority("high");
      setAssignedTo("warden");
      setVisibility("private");
      setErrors({});
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to submit complaint");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT SIDE: COMPLAINT FORM */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Raise a Complaint
              </CardTitle>
              <CardDescription>
                Submit your concern and it will be assigned to the appropriate staff
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Complaint Type */}
              <div className="space-y-2">
                <Label htmlFor="type">
                  Complaint Type <span className="text-destructive">*</span>
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select complaint type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Water">Water Issue</SelectItem>
                    <SelectItem value="Electricity">Electricity</SelectItem>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Food">Food Quality</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.type}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="desc">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="desc"
                  placeholder="Describe your issue in detail..."
                  value={desc}
                  onChange={(e) => {
                    setDesc(e.target.value);
                    setErrors((prev) => ({ ...prev, desc: "" }));
                  }}
                  rows={4}
                  className="resize-none"
                />
                {errors.desc && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.desc}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Can wait</SelectItem>
                    <SelectItem value="medium">Medium - Should be addressed soon</SelectItem>
                    <SelectItem value="high">High - Urgent attention needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Assigned To */}
              <div className="space-y-2">
                <Label htmlFor="assignedTo">
                  Assign To <span className="text-destructive">*</span>
                </Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger id="assignedTo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="warden">Warden</SelectItem>
                    <SelectItem value="electrician">Electrician</SelectItem>
                    <SelectItem value="plumber">Plumber</SelectItem>
                    <SelectItem value="cleaner">Cleaning Staff</SelectItem>
                    <SelectItem value="maintenance">Maintenance Team</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="mess">Mess Manager</SelectItem>
                  </SelectContent>
                </Select>
                {errors.assignedTo && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.assignedTo}
                  </p>
                )}
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select
                  value={visibility}
                  onValueChange={(v: "private" | "public") => setVisibility(v)}
                >
                  <SelectTrigger id="visibility">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Private</p>
                          <p className="text-xs text-muted-foreground">
                            Only visible to admin
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Public</p>
                          <p className="text-xs text-muted-foreground">
                            Visible to all students
                          </p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {visibility === "public"
                    ? "Your complaint will be visible to other students"
                    : "Your complaint will only be visible to administrators"}
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  All complaints are taken seriously and will be addressed promptly.
                  You will be notified of updates.
                </AlertDescription>
              </Alert>
            </CardContent>

            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Complaint
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT SIDE: PUBLIC COMPLAINTS FEED */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Public Complaints
                  </CardTitle>
                  <CardDescription>
                    View complaints shared by other students
                  </CardDescription>
                </div>
                {publicComplaints && (
                  <Badge variant="secondary">
                    {publicComplaints.length} active
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <ComplaintFeed complaints={publicComplaints} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ====================================================== */
/* COMPLAINT FEED COMPONENT */
/* ====================================================== */

interface ComplaintFeedProps {
  complaints: any[] | undefined;
}

function ComplaintFeed({ complaints }: ComplaintFeedProps) {
  if (complaints === undefined) {
    // Loading state
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
            <div className="h-3 bg-muted rounded w-full mb-1" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (complaints.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No public complaints yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Public complaints will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {complaints.map((complaint) => (
        <ComplaintCard key={complaint._id} complaint={complaint} />
      ))}
    </div>
  );
}

/* ====================================================== */
/* COMPLAINT CARD COMPONENT */
/* ====================================================== */

interface ComplaintCardProps {
  complaint: any;
}

function ComplaintCard({ complaint }: ComplaintCardProps) {
  const priorityConfig = {
    high: {
      color: "destructive",
      label: "High Priority",
    },
    medium: {
      color: "default",
      label: "Medium Priority",
    },
    low: {
      color: "secondary",
      label: "Low Priority",
    },
  };

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      label: "Pending",
    },
    in_progress: {
      icon: Loader2,
      color: "text-blue-600",
      label: "In Progress",
    },
    resolved: {
      icon: CheckCircle2,
      color: "text-green-600",
      label: "Resolved",
    },
  };

  const priorityInfo = priorityConfig[complaint.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const statusInfo = statusConfig[complaint.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <Card className="border-l-4" style={{ borderLeftColor: complaint.priority === "high" ? "hsl(var(--destructive))" : "hsl(var(--border))" }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={priorityInfo.color as any}>
                {complaint.complaint_type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {priorityInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Assigned to: {complaint.assigned_to}
            </p>
            
          </div>
          <div className={`flex items-center gap-1 ${statusInfo.color}`}>
            <StatusIcon className="h-4 w-4" />
            <span className="text-xs font-medium">{statusInfo.label}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm">{complaint.description}</p>
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground pt-0">
        <div className="flex items-center justify-between w-full">
          <span>
            {complaint._creationTime
              ? new Date(complaint._creationTime).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now"}
          </span>
          {complaint.student_name && (
            <span>By: {complaint.student_name}</span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
