import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

/** Skills whose invocation gets the reminder. Bare names, without the `skill:` prefix. */
const GRILL_SKILLS: Record<string, true> = { "grill-me": true, "grill-with-docs": true };

const MESSAGE_TYPE = "grill-ask-reminder";

export const REMINDER =
	"Reminder: ask the grilling questions with the `ask` tool, not as plain chat text. " +
	"Put every question of the round (the whole frontier) in a single `ask` call, with your recommended answer as the `recommended` option.";

/** First `/skill:<name>` token, same shape as omp's own `SKILL_TOKEN_RE` (leading or mid-prompt). */
const SKILL_TOKEN_RE = /(^|\s)\/skill:([^\s/]+(?:\/[^\s/]+)?)(?=\s|$)/;

/**
 * Whether `text` is a submission that omp will turn into a `/skill:grill-me` or
 * `/skill:grill-with-docs` invocation. Mirrors omp's `parseSkillInvocation`: only the first
 * token counts, and a draft starting with another slash command or a `!`/`$` execution sigil
 * does not invoke mid-prompt tokens.
 */
export function invokesGrillSkill(text: string): boolean {
	const trimmed = text.trimStart();
	if (!trimmed.startsWith("/skill:")) {
		if (trimmed.startsWith("/") || trimmed.startsWith("!") || trimmed.startsWith("$")) return false;
	}
	const match = SKILL_TOKEN_RE.exec(trimmed);
	return match !== null && Object.hasOwn(GRILL_SKILLS, match[2]);
}

export default function grillAskReminder(pi: ExtensionAPI) {
	// The `input` hook sees the raw `/skill:` text; the skill itself is delivered as a custom
	// message that bypasses it. So flag here and inject from `before_agent_start`.
	let pending = false;

	pi.on("input", (event) => {
		pending = invokesGrillSkill(event.text);
	});

	pi.on("before_agent_start", () => {
		if (!pending) return;
		pending = false;
		return { message: { customType: MESSAGE_TYPE, content: REMINDER, display: true } };
	});
}
