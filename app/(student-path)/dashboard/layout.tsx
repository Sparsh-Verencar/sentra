import type { Metadata } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ThemeProvider } from "@/components/theme-provider";
import {     SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { ModeToggle } from "@/components/mode-toggle";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";


export const metadata: Metadata = {
    title: "Sentra",
    description: "Solving hostel issues, one complaint at a time",
    icons: {
        icon: "/convex.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ThemeProvider attribute={"class"} defaultTheme="system" enableSystem disableTransitionOnChange>
            <ConvexAuthNextjsServerProvider>
                <SidebarProvider
                    style={
                        {
                            "--sidebar-width": "calc(var(--spacing) * 72)",
                            "--header-height": "calc(var(--spacing) * 12)",
                        } as React.CSSProperties
                    }
                >
                    <AppSidebar variant="inset" />
                    <SidebarInset>
                    <SiteHeader/>
                    {children}
                    </SidebarInset>
                </SidebarProvider>
            </ConvexAuthNextjsServerProvider>
        </ThemeProvider>
    );
}
