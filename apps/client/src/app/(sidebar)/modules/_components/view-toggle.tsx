import { Grid3x3, List } from "lucide-react";
import type { ViewMode } from "../types";

export const ViewToggle = ({ viewMode, setViewMode }: ViewToggleProps) => (
  <div className="flex bg-muted rounded-lg p-1">
    <button
      onClick={() => setViewMode("grid")}
      className={`p-2 rounded-md transition-colors ${
        viewMode === "grid" ? "bg-background shadow-sm" : "hover:bg-muted/80"
      }`}
    >
      <Grid3x3 className="h-4 w-4" />
    </button>
    <button
      onClick={() => setViewMode("list")}
      className={`p-2 rounded-md transition-colors ${
        viewMode === "list" ? "bg-background shadow-sm" : "hover:bg-muted/80"
      }`}
    >
      <List className="h-4 w-4" />
    </button>
  </div>
);

type ViewToggleProps = {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
};
