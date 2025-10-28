import { Button } from "@oppsys/ui";
import { MODULE_CATEGORIES_MAPPING } from "@/app/(sidebar)/modules/modules-config";

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onChange: (category: string) => void;
}

export const CategoryFilter = ({
  categories,
  selected,
  onChange,
}: CategoryFilterProps) => (
  <div className="flex gap-2 flex-wrap">
    {categories.map((category) => (
      <Button
        key={category}
        variant={selected === category ? "default" : "outline"}
        size="sm"
        onClick={() => onChange(category)}
        className="text-xs"
      >
        {category === "all"
          ? "Tous"
          : MODULE_CATEGORIES_MAPPING[category]?.name || category}
      </Button>
    ))}
  </div>
);
