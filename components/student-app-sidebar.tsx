"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconFileAi,
  IconFileDescription,
  IconInnerShadowTop,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { BarChart3, Book, Brain, Camera, FileText, GraduationCapIcon, Megaphone, UniversityIcon, User2 } from "lucide-react"

const studentData = {
  user: {
    name: "Student",
    email: "student@example.com",
    avatar: "/avatars/student.jpg",
  },
  navMain: [
    {
      title: "Announcements",
      url: "/student-dashboard/announcements",
      icon: Megaphone,
    },
    {
      title: "Complaints",
      url: "/student-dashboard/complaints",
      icon: Book,
    },
    {
      title: "Lost And Found",
      url: "/student-dashboard/lost-and-found",
      icon: Camera,
    },
    {
      title: "Student Info",
      url: "/student-dashboard/info",
      icon: GraduationCapIcon,
    },
  ],
}


export function StudentAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={studentData.navMain as any} />
      </SidebarContent>
    </Sidebar>
  )
}
