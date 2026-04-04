# Open Pull Request

Open a GitHub Pull Request for the current branch. Follow these steps exactly.

## Step 1 — Get current branch

Run `git branch --show-current`. If the result is `main` or `master`, stop and tell the user: "You're already on main — switch to a feature branch first."

## Step 2 — Detect linked issue

Check the branch name for an issue number encoded as `#<number>` (e.g. `claude/feat/add-dark-mode#42`):
- If found: extract it and tell the user "I found linked issue #<number> — I'll close it when this PR merges."
- If not found: ask "Is this related to a GitHub issue? Provide the number to link it, or press enter to skip."

## Step 3 — Build the PR title and body

Run `git log main..HEAD --oneline` to see the commits on this branch.

Derive a clear PR title from the branch name and commits (imperative, concise).

Build the PR body using this template:

```
## Summary
<2-3 bullet points describing what changed and why>

## Test plan
- [ ] <manual step or automated test to verify the change>
```

If a linked issue number was found or provided, append to the body:
```

Closes #<number>
```

(`Closes #N` is the GitHub magic keyword — it auto-links and closes the issue when the PR merges.)

Show the full title and body to the user and ask: "Looks good, or any changes?"

## Step 4 — Push the branch

Run:
```bash
git push -u origin <branch-name>
```

## Step 5 — Create the PR

Run:
```bash
gh pr create --title "<title>" --body "<body>" --base main
```

Print the PR URL returned by `gh`.

## Step 6 — Next steps

Tell the user: "PR is open. Once it's reviewed and ready to ship, run `/merge-main` to bump the version, merge, and tag."
