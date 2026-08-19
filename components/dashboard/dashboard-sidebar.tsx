"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DotsThreeIcon,
  FolderSimpleIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  PlugsIcon,
  PlusIcon,
  PuzzlePieceIcon,
  type Icon,
} from "@phosphor-icons/react"

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useProjects, useRecentChats } from "@/hooks/use-dashboard-query"
import { cn } from "@/lib/utils"

const primaryNav = [
  { href: "/dashboard", label: "New chat", icon: NotePencilIcon, exact: true },
  { href: "/dashboard/search", label: "Search chat", icon: MagnifyingGlassIcon, exact: true },
  { href: "/dashboard/plugins", label: "Plugins", icon: PuzzlePieceIcon, exact: true },
  { href: "/dashboard/mcps", label: "MCPs", icon: PlugsIcon, exact: true },
] as const

function NavButton({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string
  label: string
  icon?: Icon
  isActive: boolean
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton isActive={isActive} render={<Link href={href} />}>
        {Icon ? <Icon weight={isActive ? "fill" : "duotone"} /> : null}
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function DashboardSidebar() {
  const pathname = usePathname()
  const { data: projects } = useProjects()
  const { data: recents } = useRecentChats()

  const hasProjects = (projects ?? []).length > 0
  const recentProjects = (projects ?? [])
    .slice()
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    )
    .slice(0, 3)
  const hasRecents = (recents ?? []).length > 0

  return (
    <SidebarContent className="overflow-hidden">
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {primaryNav.map((item) => (
              <NavButton
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={
                  item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                }
              />
            ))}
            {!hasProjects ? (
              <NavButton
                href="/dashboard/projects/new"
                label="New Project"
                icon={PlusIcon}
                isActive={pathname === "/dashboard/projects/new"}
              />
            ) : null}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {hasProjects ? (
        <SidebarGroup>
          <SidebarGroupLabel>Project</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavButton
                href="/dashboard/projects/new"
                label="New Project"
                icon={PlusIcon}
                isActive={pathname === "/dashboard/projects/new"}
              />
              {recentProjects.map((project) => (
                <NavButton
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  label={project.name}
                  icon={FolderSimpleIcon}
                  isActive={pathname === `/dashboard/projects/${project.id}`}
                />
              ))}
              <NavButton
                href="/dashboard/projects"
                label="All projects"
                icon={DotsThreeIcon}
                isActive={pathname === "/dashboard/projects"}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ) : null}

      {hasRecents ? (
        <SidebarGroup className="min-h-0 flex-1">
          <SidebarGroupLabel>Recents</SidebarGroupLabel>
          <SidebarGroupContent className="min-h-0 flex-1">
            <div
              className={cn(
                "min-h-0 max-h-full overflow-y-auto scroll-fade-b",
                "overscroll-contain"
              )}
            >
              <SidebarMenu>
                {recents.map((chat) => (
                  <NavButton
                    key={chat.id}
                    href={`/dashboard/projects/${chat.projectId}`}
                    label={chat.title}
                    isActive={false}
                  />
                ))}
              </SidebarMenu>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      ) : null}
    </SidebarContent>
  )
}

export { DashboardSidebar }
