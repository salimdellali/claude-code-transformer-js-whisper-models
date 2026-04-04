# Create GitHub Issue

Help the user draft and publish a GitHub issue. Follow these steps exactly.

## Step 1 — Gather context

If the user provided a description or title with the command, use it as the starting point. Otherwise, ask them one focused question: **"What's the issue about?"** — wait for their answer before proceeding.

## Step 2 — Draft the issue

Based on what the user provided, draft:

- **Title**: concise, imperative (e.g. "Add dark mode toggle", "Fix crash on empty input")
- **Body**: use this template:

```
## What
<one paragraph describing the problem or feature>

## Why
<why this matters — user impact, bug consequence, or motivation>

## Acceptance criteria
- [ ] <testable condition 1>
- [ ] <testable condition 2>

---
🤖 Opened with [Claude Code](https://claude.ai/code)
```

Show the full draft to the user and ask: **"Looks good, or any changes?"**

## Step 3 — Determine labels

The `claude` label is always applied automatically (it marks issues opened by Claude Code).

Suggest one additional label based on the content:
- `bug` — something is broken
- `enhancement` — new feature or improvement
- `question` — needs clarification before work begins

Run `gh label list` first and suggest from existing labels. Ask the user to confirm or change the additional label.

## Step 4 — Publish the issue

Once the user confirms, run:

```bash
gh issue create --title "<title>" --body "<body>" --label "<label1>,<label2>"
```

## Step 5 — Confirm and offer next steps

Print the issue URL returned by `gh issue create`.

Then ask: **"Should I start working on this now?"**
- If yes → invoke `/new-branch` with the issue title and number as context, then begin implementation
- If no → done
