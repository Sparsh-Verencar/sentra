import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import data from "./data.json"
import Image from "next/image"

export default function Page() {
  return (
        <div className="flex flex-1 items-center justify-center">
          <Image src="/convex.svg" width={200} height={200} alt="convex-logo"/>
        </div>
  )
}
