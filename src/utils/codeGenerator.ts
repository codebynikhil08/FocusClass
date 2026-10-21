/**
 * Generates a clean, unambiguous session code like 'FC-4821'
 */
export function generateSessionCode(prefix = 'FC'): string {
  // Avoid ambiguous characters like 0/O, 1/I
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${result}`;
}
