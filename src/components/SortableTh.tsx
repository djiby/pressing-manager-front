import type { SortDirection, SortState } from "@/lib/sort";

type SortableThProps<T extends string> = {
  label: string;
  column: T;
  sort: SortState<T>;
  onSort: (column: T) => void;
  className?: string;
};

function indicator(active: boolean, direction: SortDirection): string {
  if (!active) {
    return "↕";
  }
  return direction === "asc" ? "↑" : "↓";
}

export function SortableTh<T extends string>({
  label,
  column,
  sort,
  onSort,
  className = "",
}: SortableThProps<T>) {
  const active = sort.key === column;
  return (
    <th className={`px-4 py-3 font-semibold ${className}`}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 hover:text-brand"
        aria-sort={
          active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"
        }
      >
        <span>{label}</span>
        <span className="text-xs text-muted" aria-hidden>
          {indicator(active, sort.direction)}
        </span>
      </button>
    </th>
  );
}
