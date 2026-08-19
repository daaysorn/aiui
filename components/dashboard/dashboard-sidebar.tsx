"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BuildingsIcon,
  DotsThreeIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  HashIcon,
  MagnifyingGlassIcon,
  PlugsIcon,
  PuzzlePieceIcon,
  RobotIcon,
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
import { useChannels, useProjects, useRecentChats, useUserOverview } from "@/hooks/use-dashboard-query"
import { cn } from "@/lib/utils"

const primaryNav = [
  { href: "/dashboard", label: "New bot", icon: RobotIcon, exact: true },
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
  const { data: overview } = useUserOverview()
  const { data: projects } = useProjects()
  const { data: channels } = useChannels()
  const { data: recents } = useRecentChats()

  const organisations = overview?.organizations ?? []
  const hasOrganisations = organisations.length > 0
  const recentOrganisations = organisations.slice(0, 3)
  const hasProjects = (projects ?? []).length > 0
  const recentProjects = (projects ?? [])
    .slice()
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    )
    .slice(0, 3)
  const hasChannels = (channels ?? []).length > 0
  const recentChannels = (channels ?? []).slice(0, 3)
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
            {!hasOrganisations ? (
              <NavButton
                href="/dashboard/organisations/new"
                label="New organisation"
                icon={BuildingsIcon}
                isActive={pathname === "/dashboard/organisations/new"}
              />
            ) : null}
            {!hasProjects ? (
              <NavButton
                href="/dashboard/projects/new"
                label="New project"
                icon={FolderPlusIcon}
                isActive={pathname === "/dashboard/projects/new"}
              />
            ) : null}
            {!hasChannels ? (
              <NavButton
                href="/dashboard/channels/new"
                label="New channel"
                icon={HashIcon}
                isActive={pathname === "/dashboard/channels/new"}
              />
            ) : null}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {hasOrganisations ? (
        <SidebarGroup>
          <SidebarGroupLabel>Organisation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavButton
                href="/dashboard/organisations/new"
                label="New organisation"
                icon={BuildingsIcon}
                isActive={pathname === "/dashboard/organisations/new"}
              />
              {recentOrganisations.map((organisation) => (
                <NavButton
                  key={organisation.id}
                  href={`/dashboard/organisations/${organisation.slug}`}
                  label={organisation.name}
                  icon={BuildingsIcon}
                  isActive={
                    pathname === `/dashboard/organisations/${organisation.slug}`
                  }
                />
              ))}
              <NavButton
                href="/dashboard/organisations"
                label="All organisations"
                icon={DotsThreeIcon}
                isActive={pathname === "/dashboard/organisations"}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ) : null}

      {hasProjects ? (
        <SidebarGroup>
          <SidebarGroupLabel>Project</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavButton
                href="/dashboard/projects/new"
                label="New project"
                icon={FolderPlusIcon}
                isActive={pathname === "/dashboard/projects/new"}
              />
              {recentProjects.map((project) => (
                <NavButton
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  label={project.name}
                  icon={FolderOpenIcon}
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

      {hasChannels ? (
        <SidebarGroup>
          <SidebarGroupLabel>Channel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavButton
                href="/dashboard/channels/new"
                label="New channel"
                icon={HashIcon}
                isActive={pathname === "/dashboard/channels/new"}
              />
              {recentChannels.map((channel) => (
                <NavButton
                  key={channel.id}
                  href={`/dashboard/channels/${channel.id}`}
                  label={channel.name}
                  icon={HashIcon}
                  isActive={pathname === `/dashboard/channels/${channel.id}`}
                />
              ))}
              <NavButton
                href="/dashboard/channels"
                label="All channels"
                icon={DotsThreeIcon}
                isActive={pathname === "/dashboard/channels"}
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
