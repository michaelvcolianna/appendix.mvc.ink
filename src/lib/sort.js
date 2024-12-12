export const byDate = (a, b) =>
  parseFloat(new Date(a.sort_by_date).getTime()) -
  parseFloat(new Date(b.sort_by_date).getTime());
