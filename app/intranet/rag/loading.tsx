export default function RagLoading() {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-gray-100 rounded-lg animate-pulse" />
            <div className="h-8 w-52 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-5 w-96 bg-gray-100 rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border p-5 space-y-3">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
