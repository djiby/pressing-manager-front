export type SortDirection = "asc" | "desc";

export type SortState<T extends string = string> = {
  key: T;
  direction: SortDirection;
};

export function toggleSort<T extends string>(
  current: SortState<T>,
  key: T,
): SortState<T> {
  if (current.key === key) {
    return {
      key,
      direction: current.direction === "asc" ? "desc" : "asc",
    };
  }
  return { key, direction: "asc" };
}

export function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) {
    return 0;
  }
  if (a == null) {
    return 1;
  }
  if (b == null) {
    return -1;
  }
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  if (typeof a === "boolean" && typeof b === "boolean") {
    return Number(a) - Number(b);
  }
  return String(a).localeCompare(String(b), "fr", {
    numeric: true,
    sensitivity: "base",
  });
}

export function sortRows<T>(
  rows: T[],
  sort: SortState,
  getValue: (row: T, key: string) => unknown,
): T[] {
  const sorted = [...rows].sort((left, right) => {
    const result = compareValues(
      getValue(left, sort.key),
      getValue(right, sort.key),
    );
    return sort.direction === "asc" ? result : -result;
  });
  return sorted;
}
