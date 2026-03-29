# Feature Branch

When this command is invoked, you MUST create a git branch before writing any code. Follow these steps exactly:

## Step 1 — Determine the branch name

Derive a short, kebab-case branch name from the user's request:
- Features → `claude:feat/<short-description>` (e.g. `claude:feat/add-login-page`)
- Bug fixes → `claude:fix/<short-description>` (e.g. `claude:fix/crash-on-empty-input`)
- Refactors → `claude:refactor/<short-description>` (e.g. `claude:refactor/add-user-function`)
- Keep it under 50 characters total

## Step 2 — Check git status

Run `git status` to confirm the repo is clean (or note any uncommitted work). If the working tree is dirty, tell the user and ask whether to stash, commit, or abort.

## Step 3 — Create and switch to the branch

Run:
```
git checkout -b <branch-name>
```

Confirm the branch was created by echoing the current branch name.

## Step 4 — Implement

Proceed with the feature or bug fix as requested. Do all your work on this new branch.

## Step 5 — Summary

When done, remind the user which branch the changes are on and suggest next steps (e.g. commit and open a PR).
