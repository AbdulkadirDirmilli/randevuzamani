import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function BrandsLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <Skeleton className="h-10 w-40 mx-auto mb-4" />
        <Skeleton className="h-6 w-80 mx-auto" />
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto mb-12">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-8 mb-12">
        <div className="text-center">
          <Skeleton className="h-8 w-12 mx-auto mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="text-center">
          <Skeleton className="h-8 w-12 mx-auto mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Section Title */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 text-center">
              <Skeleton className="w-20 h-20 mx-auto rounded-full mb-4" />
              <Skeleton className="h-5 w-24 mx-auto mb-2" />
              <Skeleton className="h-5 w-16 mx-auto rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
