"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  image?: string
}

export interface ChatRoom {
  id: string
  title: string
  lastMessage?: string
  lastActivity: Date
  messageCount: number
}

interface ChatContextType {
  chatrooms: ChatRoom[]
  messages: Record<string, Message[]>
  loading: boolean
  createChatroom: (title: string) => Promise<string>
  deleteChatroom: (id: string) => void
  sendMessage: (chatId: string, content: string, image?: string) => void
  loadMoreMessages: (chatId: string) => void
  isTyping: boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatrooms, setChatrooms] = useState<ChatRoom[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load data from localStorage
    const storedChatrooms = localStorage.getItem("chatrooms")
    const storedMessages = localStorage.getItem("messages")

    if (storedChatrooms) {
      const parsedChatrooms = JSON.parse(storedChatrooms).map((room: any) => ({
        ...room,
        lastActivity: new Date(room.lastActivity),
      }))
      setChatrooms(parsedChatrooms)
    }

    if (storedMessages) {
      const parsedMessages = JSON.parse(storedMessages)
      Object.keys(parsedMessages).forEach((chatId) => {
        parsedMessages[chatId] = parsedMessages[chatId].map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      })
      setMessages(parsedMessages)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    // Save to localStorage whenever data changes
    if (!loading) {
      localStorage.setItem("chatrooms", JSON.stringify(chatrooms))
      localStorage.setItem("messages", JSON.stringify(messages))
    }
  }, [chatrooms, messages, loading])

  const createChatroom = async (title: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newRoom: ChatRoom = {
          id: Date.now().toString(),
          title,
          lastActivity: new Date(),
          messageCount: 0,
        }
        setChatrooms((prev) => [newRoom, ...prev])
        setMessages((prev) => ({ ...prev, [newRoom.id]: [] }))
        toast({
          title: "Chatroom Created",
          description: `"${title}" is ready for conversation`,
        })
        resolve(newRoom.id)
      }, 500)
    })
  }

  const deleteChatroom = (id: string) => {
    const room = chatrooms.find((r) => r.id === id)
    setChatrooms((prev) => prev.filter((room) => room.id !== id))
    setMessages((prev) => {
      const newMessages = { ...prev }
      delete newMessages[id]
      return newMessages
    })
    toast({
      title: "Chatroom Deleted",
      description: `"${room?.title}" has been removed`,
    })
  }

  const generateAIResponse = (userMessage: string): string => {
    const responses = [
      "That's an interesting perspective! Let me think about that...",
      "I understand what you're asking. Here's my take on it:",
      "Great question! Based on what you've shared:",
      "I can help you with that. Here's what I think:",
      "That's a thoughtful point. Let me elaborate:",
      "I see what you mean. From my understanding:",
      "Excellent question! Here's how I would approach this:",
      "That's worth exploring further. Consider this:",
    ]

    const elaborations = [
      "The key factors to consider are complexity, context, and practical application.",
      "This involves multiple layers of analysis and careful consideration of various perspectives.",
      "There are several approaches we could take, each with their own benefits and challenges.",
      "The solution often lies in finding the right balance between different competing priorities.",
      "It's important to look at both the immediate implications and long-term consequences.",
      "This requires a nuanced understanding of the underlying principles and mechanisms.",
      "The most effective strategy usually involves a combination of proven methods and innovative thinking.",
      "Success in this area typically depends on careful planning and adaptive execution.",
    ]

    const intro = responses[Math.floor(Math.random() * responses.length)]
    const elaboration = elaborations[Math.floor(Math.random() * elaborations.length)]

    return `${intro}\n\n${elaboration}`
  }

  const sendMessage = (chatId: string, content: string, image?: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: "user",
      timestamp: new Date(),
      image,
    }

    // Add user message
    setMessages((prev) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), userMessage],
    }))

    // Update chatroom
    setChatrooms((prev) =>
      prev.map((room) =>
        room.id === chatId
          ? {
              ...room,
              lastMessage: content,
              lastActivity: new Date(),
              messageCount: room.messageCount + 1,
            }
          : room,
      ),
    )

    // Show typing indicator and generate AI response
    setIsTyping(true)

    setTimeout(
      () => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: generateAIResponse(content),
          sender: "ai",
          timestamp: new Date(),
        }

        setMessages((prev) => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), aiResponse],
        }))

        setChatrooms((prev) =>
          prev.map((room) =>
            room.id === chatId
              ? {
                  ...room,
                  lastMessage: aiResponse.content.substring(0, 50) + "...",
                  lastActivity: new Date(),
                  messageCount: room.messageCount + 1,
                }
              : room,
          ),
        )

        setIsTyping(false)
      },
      2000 + Math.random() * 2000,
    ) // Random delay between 2-4 seconds
  }

  const loadMoreMessages = (chatId: string) => {
    // Simulate loading older messages
    setTimeout(() => {
      const currentMessages = messages[chatId] || []
      const olderMessages: Message[] = Array.from({ length: 10 }, (_, i) => ({
        id: `old-${Date.now()}-${i}`,
        content: `This is an older message #${i + 1}. It contains some historical conversation data that was previously exchanged.`,
        sender: i % 2 === 0 ? "user" : "ai",
        timestamp: new Date(Date.now() - (currentMessages.length + i + 1) * 60000),
      }))

      setMessages((prev) => ({
        ...prev,
        [chatId]: [...olderMessages, ...currentMessages],
      }))
    }, 1000)
  }

  return (
    <ChatContext.Provider
      value={{
        chatrooms,
        messages,
        loading,
        createChatroom,
        deleteChatroom,
        sendMessage,
        loadMoreMessages,
        isTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
