import { type ExtensionAPI, type ExtensionContext, settings } from "@oh-my-pi/pi-coding-agent";
import { cfgCompactionThresholdTokens } from "@oh-my-pi/pi-coding-agent/session/context-settings";
import { compactionLimitFor, formatContextTokens } from "./format";

/** Status key. The `status` status line segment orders extension statuses by key. */
const STATUS_KEY = "context-tokens";

export default function contextTokens(pi: ExtensionAPI) {
	const update = (_event: unknown, ctx: ExtensionContext) => {
		const usage = ctx.getContextUsage();
		// Runtime-only (not written to config.yml); no override means omp's default threshold.
		if (usage) {
			const forced = compactionLimitFor(usage.contextWindow);
			if (forced === undefined) cfgCompactionThresholdTokens.clearOverride(settings);
			else cfgCompactionThresholdTokens.override(settings, forced);
		}
		ctx.ui.setStatus(STATUS_KEY, formatContextTokens(usage, cfgCompactionThresholdTokens.get(settings)));
	};

	// Anything that changes the model or what is in the context window. No model-change event
	// exists, so turn_start catches a model switch before the next turn's compaction check.
	for (const event of [
		"session_start",
		"session_switch",
		"session_branch",
		"session_tree",
		"session_compact",
		"turn_start",
		"turn_end",
	] as const) {
		pi.on(event, update);
	}
}
