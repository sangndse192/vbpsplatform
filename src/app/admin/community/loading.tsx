export default function CommunityLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
        <div className="hidden lg:block space-y-4">
          <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-48 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
