interface LoadingSkeletonProps {
  type?: "card" | "list" | "profile" | "text";
  count?: number;
}

export default function LoadingSkeleton({ type = "card", count = 1 }: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className="p-6 bg-[#1a1a1b] rounded-lg border border-gray-800 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-800 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/4"></div>
              </div>
              <div className="h-8 w-8 bg-gray-800 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="h-8 bg-gray-800 rounded w-20"></div>
              <div className="h-10 bg-gray-800 rounded w-24"></div>
            </div>
          </div>
        );

      case "list":
        return (
          <div className="p-4 bg-[#1a1a1b] rounded-lg border border-gray-800 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-800 rounded w-1/3"></div>
                <div className="h-3 bg-gray-800 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-gray-800 rounded w-16"></div>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="p-6 bg-[#1a1a1b] rounded-lg border border-gray-800 animate-pulse">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-800 rounded w-1/3"></div>
                <div className="h-4 bg-gray-800 rounded w-1/4"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-8 bg-gray-800 rounded"></div>
                  <div className="h-3 bg-gray-800 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        );

      case "text":
        return (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-800 rounded w-full"></div>
            <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            <div className="h-4 bg-gray-800 rounded w-4/6"></div>
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </>
  );
}
