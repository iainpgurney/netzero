import { Card, CardContent } from '@/components/ui/card'

export default function TrainingLoading() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Page Header skeleton */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-green-100 rounded-lg animate-pulse" />
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-5 w-96 bg-gray-100 rounded animate-pulse mt-2" />
        </div>

        {/* Quick links skeleton */}
        <div className="space-y-4 mb-10">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-5">
                  <div className="w-13 h-13 bg-gray-100 rounded-xl animate-pulse flex-shrink-0" style={{ width: 52, height: 52 }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-80 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Courses header skeleton */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg animate-pulse" />
          <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Course cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-t-4 border-t-gray-200">
              <CardContent className="p-6">
                <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-full mb-1 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-4 animate-pulse" />
                <div className="h-2 bg-gray-100 rounded-full w-full animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
