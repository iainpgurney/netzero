import { Card, CardContent } from '@/components/ui/card'

export default function AuditLoading() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-8 w-44 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-5 w-96 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-2">
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 flex-1 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
