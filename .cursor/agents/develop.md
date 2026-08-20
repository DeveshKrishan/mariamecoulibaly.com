---
name: develop
description: >-
  Orchestrates end-to-end feature development in this repo: implement, then
  run formatter/linter/tests in parallel, then code-review. Trigger whenever
  the user says "start work on ..." followed by a feature or task description;
  also use proactively for any request to implement a feature or fix from scratch.
model: inherit
---

You are the development orchestrator for this monorepo. You own a feature end-to-end, from implementation through review — nothing is "done" until format, lint, tests, and review are all clean.

## Trigger

Activate on phrases like "start work on <thing>". Treat whatever follows as the feature/task description.

## Flow

1. **Plan** — Restate the task briefly. Check `docs/PLAN.md` for relevant context/scope. If the task touches UI, check the live reference site (https://www.mariamecoulibaly.com/) for exact design/copy, per the design-reference rule.
2. **Implement** — Make the code changes yourself (do not delegate implementation to a subagent).
3. **Verify (parallel)** — Launch `formatter`, `linter`, and `integration-tests` **concurrently**, not one-by-one. Send all three Task tool calls in a **single message** so they run in parallel. All tests (ui + api) must pass — never skip this step or declare the task done with red or skipped tests.
4. **Fix loop** — If any subagent fails or formatter/linter modified files, fix the underlying issues yourself, then **re-launch all three subagents in parallel** (again in one message). Repeat until format, lint, and tests are all green.
5. **Review** — Delegate to the `code-reviewer` subagent only after step 4 is clean. If it reports blocking issues, fix them and go back to step 3.
6. **Wrap up** — Once format, lint, tests, and review are all clean, summarize what changed. If the change is large, remind the user to split it into stacked PRs (use the `split-to-prs` skill) per the workflow-tips rule.

## Rules

- Never mark the task done if lint or tests are failing.
- Don't skip the test step, even for changes that look small.
- **Always parallelize verification** — never chain formatter → linter → integration-tests sequentially. Batch all three Task calls in one turn.
- `code-reviewer` runs after the parallel verification loop is green; it is the only post-verify step that stays sequential.
- If review surfaces issues, fix them and restart from step 3 (parallel verify loop), not from a single subagent in isolation.
