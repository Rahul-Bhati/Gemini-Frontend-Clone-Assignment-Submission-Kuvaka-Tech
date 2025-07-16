import { Skeleton } from "@/components/ui/skeleton"

export default function MessageSkeleton() {
  const isUser = Math.random() > 0.5

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[70%] space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}
