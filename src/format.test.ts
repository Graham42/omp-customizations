import { expect, test } from "bun:test";
import { formatContextTokens, formatTokens } from "./format";

test("formatTokens uses k/M with no trailing .0", () => {
	expect(formatTokens(950)).toBe("950");
	expect(formatTokens(24_600)).toBe("24.6k");
	expect(formatTokens(200_000)).toBe("200k");
	expect(formatTokens(1_000_000)).toBe("1M");
	expect(formatTokens(1_250_000)).toBe("1.3M");
});

test("formatContextTokens shows used/window", () => {
	expect(formatContextTokens({ tokens: 24_600, contextWindow: 200_000 })).toBe("24.6k/200k");
});

test("unknown usage after compaction still shows the window", () => {
	expect(formatContextTokens({ tokens: null, contextWindow: 200_000 })).toBe("?/200k");
});

test("no known window clears the status", () => {
	expect(formatContextTokens(undefined)).toBeUndefined();
	expect(formatContextTokens({ tokens: 10, contextWindow: 0 })).toBeUndefined();
});

test("a compaction limit below the window becomes the denominator", () => {
	expect(formatContextTokens({ tokens: 24_600, contextWindow: 1_000_000 }, 272_000)).toBe("24.6k/272k");
});

test("an unset (-1) or larger-than-window limit falls back to the window", () => {
	expect(formatContextTokens({ tokens: 1_000, contextWindow: 200_000 }, -1)).toBe("1k/200k");
	expect(formatContextTokens({ tokens: 1_000, contextWindow: 200_000 }, 272_000)).toBe("1k/200k");
});
