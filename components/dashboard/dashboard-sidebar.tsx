"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  BuildingsIcon,
  DotsThreeIcon,
  DotsThreeVerticalIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  HashIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  PlugsIcon,
  PuzzlePieceIcon,
  TrashIcon,
  type Icon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  clearRecentChats,
  deleteRecentChat,
  renameRecentChat,
} from "@/lib/api/dashboard-data"
import type { RecentChat } from "@/lib/api/types"
import { useChannels, useProjects, useRecentChats, useUserOverview } from "@/hooks/use-dashboard-query"
import { clearDashboardChat } from "@/lib/chat/dashboard-session-storage"
import {
  DASHBOARD_NEW_CHAT_EVENT,
  recentChatHref,
  threadIdFromDashboardPath,
} from "@/lib/chat/thread-title"
import { queryKeys } from "@/lib/query/keys"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const primaryNav = [
  { href: "/dashboard", label: "New bot", icon: PencilSimpleIcon, exact: true },
  { href: "/dashboard/search", label: "Search chat", icon: MagnifyingGlassIcon, exact: true },
  { href: "/dashboard/plugins", label: "Plugins", icon: PuzzlePieceIcon, exact: true },
  { href: "/dashboard/mcps", label: "MCPs", icon: PlugsIcon, exact: true },
] as const

function NavButton({
  href,
  label,
  icon: IconComponent,
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
        {IconComponent ? (
          <IconComponent weight={isActive ? "fill" : "duotone"} />
        ) : null}
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function RecentChatItem({
  chat,
  isActive,
  onRequestEdit,
  onRequestDelete,
}: {
  chat: RecentChat
  isActive: boolean
  onRequestEdit: (chat: RecentChat) => void
  onRequestDelete: (chat: RecentChat) => void
}) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        render={<Link href={recentChatHref(chat)} />}
      >
        <span>{chat.title}</span>
      </SidebarMenuButton>
      <DropdownMenu>
        <SidebarMenuAction
          showOnHover
          aria-label={`Chat options for ${chat.title}`}
          render={<DropdownMenuTrigger />}
        >
          <DotsThreeVerticalIcon weight="bold" />
        </SidebarMenuAction>
        <DropdownMenuContent side="right" align="start" className="min-w-36">
          <DropdownMenuItem onClick={() => onRequestEdit(chat)}>
            <PencilSimpleIcon />
            Edit title
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onRequestDelete(chat)}
          >
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const queryClient = useQueryClient()
  const activeThreadId = threadIdFromDashboardPath(pathname)
  const { data: overview } = useUserOverview()
  const { data: projects } = useProjects()
  const { data: channels } = useChannels()
  const { data: recents } = useRecentChats()
  const [mutating, setMutating] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<RecentChat | null>(null)
  const [chatToEdit, setChatToEdit] = useState<RecentChat | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [clearAllOpen, setClearAllOpen] = useState(false)

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
  const recentChats = recents ?? []
  const hasRecents = recentChats.length > 0
  const userId = overview?.user.id

  function leaveDeletedThread(chat?: RecentChat) {
    if (!activeThreadId) {
      return
    }
    if (!chat || (chat.scope === "workspace" && chat.id === activeThreadId)) {
      window.dispatchEvent(new Event(DASHBOARD_NEW_CHAT_EVENT))
      router.replace("/dashboard", { scroll: false })
    }
  }

  function removeChatFromCache(chat: RecentChat) {
    const previous =
      queryClient.getQueryData<RecentChat[]>(queryKeys.recentChats) ?? []
    queryClient.setQueryData<RecentChat[]>(
      queryKeys.recentChats,
      previous.filter(
        (item) => !(item.scope === chat.scope && item.id === chat.id)
      )
    )
    return previous
  }

  function clearRecentsCache() {
    const previous =
      queryClient.getQueryData<RecentChat[]>(queryKeys.recentChats) ?? []
    queryClient.setQueryData<RecentChat[]>(queryKeys.recentChats, [])
    return previous
  }

  function openEditChat(chat: RecentChat) {
    setChatToEdit(chat)
    setEditTitle(chat.title)
  }

  function confirmEditChat() {
    const chat = chatToEdit
    const title = editTitle.trim().replace(/\s+/g, " ")
    if (!chat || mutating) return
    if (!title) {
      toast.error("Title cannot be empty.")
      return
    }
    if (title.length > 120) {
      toast.error("Title is too long.")
      return
    }
    if (title === chat.title) {
      setChatToEdit(null)
      return
    }

    const previous =
      queryClient.getQueryData<RecentChat[]>(queryKeys.recentChats) ?? []
    queryClient.setQueryData<RecentChat[]>(
      queryKeys.recentChats,
      previous.map((item) =>
        item.scope === chat.scope && item.id === chat.id
          ? { ...item, title }
          : item
      )
    )
    setChatToEdit(null)
    setMutating(true)
    void renameRecentChat(chat, title)
      .catch(() => {
        queryClient.setQueryData(queryKeys.recentChats, previous)
        toast.error("Could not rename chat.")
      })
      .finally(() => {
        setMutating(false)
      })
  }

  function confirmDeleteChat() {
    const chat = chatToDelete
    if (!chat || mutating) return

    setChatToDelete(null)
    const previous = removeChatFromCache(chat)
    if (chat.scope === "workspace" && userId) {
      clearDashboardChat(userId, chat.id)
    }
    leaveDeletedThread(chat)

    setMutating(true)
    void deleteRecentChat(chat)
      .catch(() => {
        queryClient.setQueryData(queryKeys.recentChats, previous)
        toast.error("Could not delete chat.")
      })
      .finally(() => {
        setMutating(false)
      })
  }

  function confirmClearAll() {
    if (mutating) return

    setClearAllOpen(false)
    const previous = clearRecentsCache()
    if (userId) {
      for (const chat of previous) {
        if (chat.scope === "workspace") {
          clearDashboardChat(userId, chat.id)
        }
      }
    }
    leaveDeletedThread()

    setMutating(true)
    void clearRecentChats()
      .catch(() => {
        queryClient.setQueryData(queryKeys.recentChats, previous)
        toast.error("Could not delete chats.")
      })
      .finally(() => {
        setMutating(false)
      })
  }

  return (
    <>
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
            <SidebarGroupAction
              aria-label="Delete all chats"
              disabled={mutating}
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setClearAllOpen(true)}
            >
              <TrashIcon />
            </SidebarGroupAction>
            <SidebarGroupContent className="min-h-0 flex-1">
              <div
                className={cn(
                  "min-h-0 max-h-full overflow-y-auto scroll-fade-b",
                  "overscroll-contain"
                )}
              >
                <SidebarMenu>
                  {recentChats.map((chat) => (
                    <RecentChatItem
                      key={`${chat.scope}:${chat.id}`}
                      chat={chat}
                      isActive={
                        chat.scope === "workspace" &&
                        activeThreadId === chat.id
                      }
                      onRequestEdit={openEditChat}
                      onRequestDelete={setChatToDelete}
                    />
                  ))}
                </SidebarMenu>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <Dialog
        open={chatToEdit !== null}
        onOpenChange={(open) => {
          if (!open) setChatToEdit(null)
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold">
              Edit chat title
            </DialogTitle>
            <DialogDescription>Choose a short title.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="recent-chat-title">Title</Label>
            <Input
              id="recent-chat-title"
              value={editTitle}
              maxLength={120}
              autoFocus
              onChange={(event) => setEditTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  confirmEditChat()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              disabled={mutating}
              onClick={() => setChatToEdit(null)}
            >
              Cancel
            </Button>
            <Button loading={mutating} onClick={confirmEditChat}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={chatToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setChatToDelete(null)
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold">
              Delete this chat?
            </DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              disabled={mutating}
              onClick={() => setChatToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={mutating}
              onClick={confirmDeleteChat}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-semibold">
              Delete all chats?
            </DialogTitle>
            <DialogDescription>This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              disabled={mutating}
              onClick={() => setClearAllOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={mutating}
              onClick={confirmClearAll}
            >
              Delete all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export { DashboardSidebar }
