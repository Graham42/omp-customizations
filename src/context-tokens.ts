import type { ExtensionAPI, ExtensionContext } from "@oh-my-pi/pi-coding-agent";

/** Status key. The `status` status line segment orders extension statuses by key. */
const STATUS_KEY = "context-tokens";

/** 950 -> "950", 24_600 -> "24.6k", 200_000 -> "200k", 1_000_000 -> "1M". */
export function formatTokens(n: number): string {
	if (n < 1_000) return String(Math.round(n));
	if (n < 1_000_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
	return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}

interface ContextUsage {
	/** Tokens in the context, or null when unknown (e.g. right after a compaction). */
	tokens: number | null;
	contextWindow: number;
}

/** "24.6k/200k", "?/200k" when the used count is unknown, or undefined with no known window. */
export function formatContextTokens(usage: ContextUsage | undefined): string | undefined {
	if (!usage || !(usage.contextWindow > 0)) return undefined;
	const used = usage.tokens === null || usage.tokens === undefined ? "?" : formatTokens(usage.tokens);
	return `${used}/${formatTokens(usage.contextWindow)}`;
}

export default function contextTokens(pi: ExtensionAPI) {
	const update = (_event: unknown, ctx: ExtensionContext) => {
		ctx.ui.setStatus(STATUS_KEY, formatContextTokens(ctx.getContextUsage()));
	};

	// Anything that changes what is in the context window.
	for (const event of [
		"session_start",
		"session_switch",
		"session_branch",
		"session_tree",
		"session_compact",
		"turn_end",
	] as const) {
		pi.on(event, update);
	}
}
