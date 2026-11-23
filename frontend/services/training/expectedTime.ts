export function expectedTimeSecondsFromRating(rating: number): number {
  if (rating <= 1200) return 600;
  if (rating <= 1600) return 1200;
  if (rating <= 2000) return 1800;
  if (rating <= 2400) return 2700;
  return 3600;
}
