# Commit Changes

When this command is invoked, follow these steps exactly:

## Step 1 — Show changed files

Run `git status` and display the output to the user so they can see what will be committed.

## Step 2 — Suggest a commit message

Read the staged and unstaged changes with `git diff HEAD` to understand what changed, then suggest a concise commit message following the conventional commits format:
- `claude (feat): <description>` for new features
- `claude (fix): <description>` for bug fixes
- `claude (chore): <description>` for maintenance tasks
- `claude (refactor): <description>` for code refactors
- `claude (docs): <description>` for documentation changes

Present the suggestion and ask: "Does this commit message work, or would you like to provide your own?"

Wait for the user's response before continuing.

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
