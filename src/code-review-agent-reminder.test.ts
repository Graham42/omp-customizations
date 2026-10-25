import { expect, test } from "bun:test";
import { invokesCodeReview } from "./code-review-agent-reminder";

test("matches the leading and mid-prompt /skill:code-review forms", () => {
	expect(invokesCodeReview("/skill:code-review")).toBe(true);
	expect(invokesCodeReview("  /skill:code-review since main")).toBe(true);
	expect(invokesCodeReview("please /skill:code-review this branch")).toBe(true);
});

test("ignores other skills, partial names and drafts that do not invoke skills", () => {
	expect(invokesCodeReview("/skill:code-reviewer")).toBe(false);
	expect(invokesCodeReview("/skill:code")).toBe(false);
	expect(invokesCodeReview("/skill:pr")).toBe(false);
	expect(invokesCodeReview("/code-review")).toBe(false);
	expect(invokesCodeReview("review since main")).toBe(false);
	expect(invokesCodeReview("/plan /skill:code-review")).toBe(false);
	expect(invokesCodeReview("! echo /skill:code-review")).toBe(false);
});
