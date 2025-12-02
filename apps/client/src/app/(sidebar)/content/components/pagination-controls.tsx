import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@oppsys/ui/components/button";

export const PaginationControls = ({
  currentPage,
  pageCount,
  setCurrentPage,
}: PaginationControlsProps) => {
  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-4 mt-8">
      <Button
        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        variant={"muted"}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {currentPage} sur {pageCount}
      </span>
      <Button
        onClick={() => setCurrentPage(Math.min(currentPage + 1, pageCount))}
        disabled={currentPage === pageCount}
        variant={"muted"}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export interface PaginationControlsProps {
  currentPage: number;
  pageCount: number;
  setCurrentPage: (page: number) => void;
}
