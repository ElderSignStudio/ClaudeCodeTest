/** Soft k/M formatting for large numbers — used in the Item Detail hero
 *  to keep big counts readable without dominating the metadata strip. */
export function formatCount(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
	return String(n);
}
