import { expect, test } from "bun:test";
import { invokesGrillSkill } from "./grill-ask-reminder";

test("matches the leading and mid-prompt /skill: forms of both grill skills", () => {
	expect(invokesGrillSkill("/skill:grill-me")).toBe(true);
	expect(invokesGrillSkill("  /skill:grill-with-docs my plan")).toBe(true);
	expect(invokesGrillSkill("stress test this /skill:grill-me please")).toBe(true);
});

test("ignores other skills, partial names and drafts that do not invoke skills", () => {
	expect(invokesGrillSkill("/skill:grilling")).toBe(false);
	expect(invokesGrillSkill("/skill:grill-me-harder")).toBe(false);
	expect(invokesGrillSkill("/skill:constructor")).toBe(false);
	expect(invokesGrillSkill("/grill-me")).toBe(false);
	expect(invokesGrillSkill("/plan /skill:grill-me")).toBe(false);
	expect(invokesGrillSkill("! echo /skill:grill-me")).toBe(false);
});
