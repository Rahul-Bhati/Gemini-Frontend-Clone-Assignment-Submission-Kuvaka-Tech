"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useChat } from "@/contexts/chat-context"

interface DeleteChatroomDialogProps {
  roomId: string | null
  onOpenChange: (open: boolean) => void
}

export default function DeleteChatroomDialog({ roomId, onOpenChange }: DeleteChatroomDialogProps) {
  const { chatrooms, deleteChatroom } = useChat()

  const room = roomId ? chatrooms.find((r) => r.id === roomId) : null

  const handleDelete = () => {
    if (roomId) {
      deleteChatroom(roomId)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={!!roomId} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Chatroom</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{room?.title}"? This action cannot be undone and all messages will be
            permanently lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
