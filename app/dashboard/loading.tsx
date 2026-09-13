import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2 p-6">
      <div className="grid gap-4 @xl/main:grid-cols-2 @3xl/main:grid-cols-3 @5xl/main:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i} className="py-6">
            <div className="space-y-3 px-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </Card>
        ))}
      </div>
      <Card className="gap-0 mt-4">
        <div className="border-b px-6 py-3 flex gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b px-6 py-3 flex gap-4 last:border-b-0">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </Card>
    </div>
  )
}
