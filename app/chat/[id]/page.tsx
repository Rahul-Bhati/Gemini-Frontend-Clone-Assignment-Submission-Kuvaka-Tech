"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import ChatRoom from "@/components/chat/chat-room"
import { Loader2 } from "lucide-react"
import { use } from "react"

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params) // unwrap the Promise using React.use()
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user && !loading) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <ChatRoom chatId={id} />
}


// "use client"

// import { useAuth } from "@/contexts/auth-context"
// import { useRouter } from "next/navigation"
// import { useEffect } from "react"
// import ChatRoom from "@/components/chat/chat-room"
// import { Loader2 } from "lucide-react"

// export default function ChatPage({ params }: { params: { id: string } }) {
//   const 
//   const { user, loading } = useAuth()
//   const router = useRouter()

//   useEffect(() => {
//     if (!user && !loading) {
//       router.push("/")
//     }
//   }, [user, loading, router])

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin" />
//       </div>
//     )
//   }

//   if (!user) {
//     return null
//   }

//   return <ChatRoom chatId={params.id} />
// }
