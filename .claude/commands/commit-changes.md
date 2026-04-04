# Commit Changes

When this command is invoked, follow these steps exactly:

## Step 1 — Show changed files

Run `git status` and display the output to the user so they can see what will be committed.

## Step 2 — Suggest a commit message

Read the staged and unstaged changes with `git diff HEAD` to understand what changed, then suggest a concise commit message following the conventional commits format:
- `claude (feat): <description>` for new **app** features visible to the user
- `claude (fix): <description>` for bug fixes
- `claude (chore): <description>` for maintenance tasks — including changes to claude commands, workflow tooling, CI, config, or anything that improves the dev process but adds no user-facing feature
- `claude (refactor): <description>` for code refactors
- `claude (docs): <description>` for documentation changes

Present the suggestion and prompt:
> `y` — use this message
> or type your own message

## Step 3 — Confirm the commit message

Use the message the user approved or the one they provided.

## Step 4 — Stage and commit

Run:
```
git add .
git commit -m "<commit_message>"
```

## Step 5 — Summary

Confirm the commit was created and show the commit hash.
