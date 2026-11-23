export function formatAvgProblemRating(
  value: number | null | undefined,
): string {
  if (value == null || typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }
  return String(Math.round(value));
}
