/**
 * Formats time in seconds to MM:SS format
 * @param totalSeconds - Total seconds to format
 * @returns Formatted time string (e.g., "5:03", "12:45")
 */
export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}
