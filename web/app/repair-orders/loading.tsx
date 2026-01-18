import { TableSkeleton } from "@/components/ui/skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function RepairOrdersLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-36" />
      </div>
      <TableSkeleton rows={10} />
    </div>
  )
}
