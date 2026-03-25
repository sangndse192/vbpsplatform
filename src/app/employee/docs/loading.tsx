export default function EmployeeDocsLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="h-10 animate-pulse rounded-lg bg-blue-50" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
