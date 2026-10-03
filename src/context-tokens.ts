import { type ExtensionAPI, type ExtensionContext, settings } from "@oh-my-pi/pi-coding-agent";
import { cfgCompactionThresholdTokens } from "@oh-my-pi/pi-coding-agent/session/context-settings";
import { formatContextTokens } from "./format";

/** Status key. The `status` status line segment orders extension statuses by key. */
const STATUS_KEY = "context-tokens";

export default function contextTokens(pi: ExtensionAPI) {
	const update = (_event: unknown, ctx: ExtensionContext) => {
		const limit = cfgCompactionThresholdTokens.get(settings);
		ctx.ui.setStatus(STATUS_KEY, formatContextTokens(ctx.getContextUsage(), limit));
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
