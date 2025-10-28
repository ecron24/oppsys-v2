import { Skeleton } from "@oppsys/ui";
import type { ViewMode } from "../types";

export function ModuleCardSkeleton({
  viewMode = "grid",
}: ModuleCardSkeletonProps) {
  if (viewMode === "list") {
    return (
      <div className="card hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="bg-muted p-3 rounded-lg h-10 w-10" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full mt-2 mb-6" />
              <div className="flex items-center gap-2 mt-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
          <Skeleton className="h-9 w-24 ml-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="flex flex-col flex-grow cursor-default">
        <div className="flex items-start justify-between gap-4 p-4 pt-0">
          <div className="flex items-center gap-3">
            <Skeleton className="bg-muted p-3 rounded-lg h-10 w-10" />
            <div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32 mb-2" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="grid gap-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
        </div>

        <div className="px-4 space-y-3 flex flex-col flex-grow">
          <Skeleton className="h-4 w-full mt-2 mb-6 flex-grow" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  );
}

type ModuleCardSkeletonProps = {
  viewMode: ViewMode;
};
