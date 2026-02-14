export default function IntranetLoading() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header skeleton */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-5 w-96 bg-gray-100 rounded animate-pulse mt-2" />
        </div>

        {/* Content skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border p-6 space-y-3">
              <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
