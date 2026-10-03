/** 950 -> "950", 24_600 -> "24.6k", 200_000 -> "200k", 1_000_000 -> "1M". */
export function formatTokens(n: number): string {
	if (n < 1_000) return String(Math.round(n));
	if (n < 1_000_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
	return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

export interface ContextUsage {
	/** Tokens in the context, or null when unknown (e.g. right after a compaction). */
	tokens: number | null;
	contextWindow: number;
}

/**
 * "24.6k/272k", "?/272k" when the used count is unknown, or undefined with no known window.
 * The denominator is `limit` when it is a positive number below the window, else the window.
 */
export function formatContextTokens(usage: ContextUsage | undefined, limit = -1): string | undefined {
	if (!usage || !(usage.contextWindow > 0)) return undefined;
	const used = usage.tokens === null || usage.tokens === undefined ? "?" : formatTokens(usage.tokens);
	const max = limit > 0 && limit < usage.contextWindow ? limit : usage.contextWindow;
	return `${used}/${formatTokens(max)}`;
}
