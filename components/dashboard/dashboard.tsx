"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { Plus, Search, MessageSquare, LogOut, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDebounce } from "@/hooks/use-debounce"
import CreateChatroomDialog from "./create-chatroom-dialog"
import DeleteChatroomDialog from "./delete-chatroom-dialog"
import ChatroomSkeleton from "./chatroom-skeleton"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { chatrooms, loading } = useChat()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const filteredChatrooms = chatrooms.filter((room) => room.title.toLowerCase().includes(debouncedSearch.toLowerCase()))

  const formatLastActivity = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Gemini Chat</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {user?.name || "User"}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search chatrooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chatrooms Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ChatroomSkeleton key={i} />
            ))}
          </div>
        ) : filteredChatrooms.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? "No chatrooms found" : "No chatrooms yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first chatroom to start a conversation with AI"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Chat
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChatrooms.map((room) => (
              <Card
                key={room.id}
                className="cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => router.push(`/chat/${room.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{room.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {room.messageCount} messages • {formatLastActivity(room.lastActivity)}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteRoomId(room.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                {room.lastMessage && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{room.lastMessage}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <CreateChatroomDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      <DeleteChatroomDialog roomId={deleteRoomId} onOpenChange={(open) => !open && setDeleteRoomId(null)} />
    </div>
  )
}
