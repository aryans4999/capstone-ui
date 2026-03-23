import { CardSkeleton, ClaimCardSkeleton } from "@/components/loading-skeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <CardSkeleton />
      <div className="space-y-4">
        <ClaimCardSkeleton />
        <ClaimCardSkeleton />
        <ClaimCardSkeleton />
      </div>
    </div>
  )
}
