/**
 * Generates a unique ID with a given prefix
 * @param prefix - The prefix to prepend to the ID
 * @returns A unique ID string in the format: prefix-timestamp-randomString
 */
export function generateId(prefix: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 11);
  return `${prefix}-${timestamp}-${randomString}`;
}
