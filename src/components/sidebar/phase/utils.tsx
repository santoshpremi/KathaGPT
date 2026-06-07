import { differenceInDays } from "date-fns";

export function getPhaseProgress(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const now = new Date();
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return { range: 0, remaining: 0 };
  }
  return {
    range: differenceInDays(endDate, startDate),
    remaining: differenceInDays(endDate, now),
  };
}
