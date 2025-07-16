"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChat } from "@/contexts/chat-context"
import { useAuth } from "@/contexts/auth-context"
import { ArrowLeft, Send, ImageIcon, MoreVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import MessageBubble from "./message-bubble"
import TypingIndicator from "./typing-indicator"
import MessageSkeleton from "./message-skeleton"
import { useToast } from "@/hooks/use-toast"

interface ChatRoomProps {
  chatId: string
}

export default function ChatRoom({ chatId }: ChatRoomProps) {
  const { chatrooms, messages, sendMessage, loadMoreMessages, isTyping } = useChat()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [message, setMessage] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasLoadedMore, setHasLoadedMore] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentRoom = chatrooms.find((room) => room.id === chatId)
  const roomMessages = messages[chatId] || []

  // Auto-scroll to bottom for new messages
  useEffect(() => {
    if (messagesEndRef.current && !loadingMore) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [roomMessages.length, isTyping, loadingMore])

  // Handle infinite scroll
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleScroll = () => {
      if (container.scrollTop === 0 && !loadingMore && !hasLoadedMore) {
        setLoadingMore(true)
        loadMoreMessages(chatId)
        setTimeout(() => {
          setLoadingMore(false)
          setHasLoadedMore(true)
        }, 1000)
      }
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [chatId, loadMoreMessages, loadingMore, hasLoadedMore])

  const handleSendMessage = () => {
    if (!message.trim() && !selectedImage) return

    sendMessage(chatId, message.trim(), selectedImage || undefined)
    setMessage("")
    setSelectedImage(null)

    toast({
      title: "Message sent",
      description: "Your message has been delivered",
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Chatroom not found</h2>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">{currentRoom.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{roomMessages.length} messages</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {loadingMore && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <MessageSkeleton key={i} />
            ))}
          </div>
        )}

        {roomMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Selected"
              className="h-16 w-16 object-cover rounded-lg"
            />
            <Button variant="outline" size="sm" onClick={() => setSelectedImage(null)}>
              Remove
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-end space-x-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <ImageIcon className="h-4 w-4" />
          </Button>

          <div className="flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="resize-none"
            />
          </div>

          <Button onClick={handleSendMessage} disabled={!message.trim() && !selectedImage}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
