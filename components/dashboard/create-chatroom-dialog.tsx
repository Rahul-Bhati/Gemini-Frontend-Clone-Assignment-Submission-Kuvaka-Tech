"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useChat } from "@/contexts/chat-context"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const chatroomSchema = z.object({
  title: z.string().min(1, "Title is required").max(50, "Title must be less than 50 characters"),
})

type ChatroomFormData = z.infer<typeof chatroomSchema>

interface CreateChatroomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateChatroomDialog({ open, onOpenChange }: CreateChatroomDialogProps) {
  const [loading, setLoading] = useState(false)
  const { createChatroom } = useChat()
  const router = useRouter()

  const form = useForm<ChatroomFormData>({
    resolver: zodResolver(chatroomSchema),
    defaultValues: {
      title: "",
    },
  })

  const onSubmit = async (data: ChatroomFormData) => {
    setLoading(true)
    try {
      const chatroomId = await createChatroom(data.title)
      onOpenChange(false)
      form.reset()
      router.push(`/chat/${chatroomId}`)
    } catch (error) {
      console.error("Failed to create chatroom:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Chatroom</DialogTitle>
          <DialogDescription>Give your new conversation a memorable name.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chatroom Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Project Discussion, Daily Standup..." disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Chatroom"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
