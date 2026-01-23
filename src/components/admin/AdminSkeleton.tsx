import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-20" />
      </CardContent>
    </Card>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b">
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-24 mb-1" />
        <Skeleton className="h-3 w-16" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-28" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-6 w-20 rounded-full" />
      </td>
      <td className="py-4 px-4">
        <Skeleton className="h-6 w-16 rounded-full" />
      </td>
      <td className="py-4 px-4 text-right">
        <Skeleton className="h-8 w-8 ml-auto rounded" />
      </td>
    </tr>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-24 mt-1" />
            </div>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Revenue Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Booking Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24 mt-1" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
            <div className="flex flex-col md:flex-row gap-3 mt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-[150px]" />
              <Skeleton className="h-10 w-[140px]" />
              <Skeleton className="h-10 w-[140px]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left"><Skeleton className="h-4 w-24" /></th>
                    <th className="py-3 px-4 text-left"><Skeleton className="h-4 w-20" /></th>
                    <th className="py-3 px-4 text-left"><Skeleton className="h-4 w-16" /></th>
                    <th className="py-3 px-4 text-left"><Skeleton className="h-4 w-16" /></th>
                    <th className="py-3 px-4 text-left"><Skeleton className="h-4 w-16" /></th>
                    <th className="py-3 px-4 text-right"><Skeleton className="h-4 w-16 ml-auto" /></th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map(i => (
                    <TableRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
