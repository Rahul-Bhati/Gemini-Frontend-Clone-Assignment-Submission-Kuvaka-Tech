"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import type { Message } from "@/contexts/chat-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const isUser = message.sender === "user"

  return (
    <div className={cn("flex group", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-4 py-2 relative",
          isUser ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
        )}
      >
        {message.image && (
          <div className="mb-2">
            <img src={message.image || "/placeholder.svg"} alt="Uploaded" className="max-w-full h-auto rounded-lg" />
          </div>
        )}

        <div className="whitespace-pre-wrap break-words">{message.content}</div>

        <div
          className={cn(
            "text-xs mt-1 flex items-center justify-between",
            isUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400",
          )}
        >
          <span>{formatTime(message.timestamp)}</span>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ml-2",
              isUser ? "hover:bg-blue-700 text-blue-100" : "hover:bg-gray-100 dark:hover:bg-gray-700",
            )}
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
