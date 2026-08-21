export function feedbackWindowOpen(deadline, now = new Date()) {
  if (!deadline) return true;
  const deadlineEnd = new Date(`${deadline}T23:59:59.999Z`);
  if (Number.isNaN(deadlineEnd.getTime())) return true;
  const graceEnd = new Date(deadlineEnd.getTime() + 3 * 86400000);
  return now <= graceEnd;
}
