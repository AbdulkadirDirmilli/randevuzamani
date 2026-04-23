import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CampaignsLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <Skeleton className="h-10 w-48 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 mx-auto" />
      </div>

      {/* Section Title */}
      <div className="flex items-center gap-2 mb-8">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-8 rounded-full" />
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div>
                    <Skeleton className="h-5 w-20 mb-1" />
                    <Skeleton className="h-6 w-40" />
                  </div>
                </div>
                <Skeleton className="h-8 w-24 rounded" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="w-20 h-20 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-10 w-full rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
