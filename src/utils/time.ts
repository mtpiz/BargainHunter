export function differenceInDays(fromIso?: string, to: Date = new Date()): number | null {
  if (!fromIso) {
    return null;
  }

  const fromDate = new Date(fromIso);
  if (Number.isNaN(fromDate.getTime())) {
    return null;
  }

  const diffMs = to.getTime() - fromDate.getTime();
  return diffMs < 0 ? 0 : Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
