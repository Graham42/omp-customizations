import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";

const SKILL = "code-review";

const MESSAGE_TYPE = "code-review-agent-reminder";

export const REMINDER =
	"Reminder: spawn the review sub-agents with `agent: \"task\"`, not `scout`. " +
	"Scout has no `bash`, so it cannot run `git diff` or `git show` and would review without the diff.";

/** First `/skill:<name>` token, same shape as omp's own `SKILL_TOKEN_RE` (leading or mid-prompt). */
const SKILL_TOKEN_RE = /(^|\s)\/skill:([^\s/]+(?:\/[^\s/]+)?)(?=\s|$)/;

/**
 * Whether `text` is a submission that omp will turn into a `/skill:code-review` invocation.
 * Mirrors omp's `parseSkillInvocation`: only the first token counts, and a draft starting with
 * another slash command or a `!`/`$` execution sigil does not invoke mid-prompt tokens.
 */
export function invokesCodeReview(text: string): boolean {
	const trimmed = text.trimStart();
	if (!trimmed.startsWith("/skill:")) {
		if (trimmed.startsWith("/") || trimmed.startsWith("!") || trimmed.startsWith("$")) return false;
	}
	const match = SKILL_TOKEN_RE.exec(trimmed);
	return match !== null && match[2] === SKILL;
}

export default function codeReviewAgentReminder(pi: ExtensionAPI) {
	// The `input` hook sees the raw `/skill:` text; the skill itself is delivered as a custom
	// message that bypasses it. So flag here and inject from `before_agent_start`.
	let pending = false;

	pi.on("input", (event) => {
		pending = invokesCodeReview(event.text);
	});

	pi.on("before_agent_start", () => {
		if (!pending) return;
		pending = false;
		return { message: { customType: MESSAGE_TYPE, content: REMINDER, display: true } };
	});
}
