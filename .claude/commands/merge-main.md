# Merge to Main

When this command is invoked, follow these steps exactly:

## Step 1 — Read current version

Read `package.json` and extract the current `version` field. Display it to the user.

## Step 2 — Ask which semver segment to bump

Ask the user: "Which part of the version should be incremented: **patch**, **minor**, or **major**?"

Wait for their answer before continuing.

## Step 3 — Calculate the new version

Given the current version (e.g. `1.2.3`):
- **patch** → increment the third number: `1.2.4`
- **minor** → increment the second number, reset patch to 0: `1.3.0`
- **major** → increment the first number, reset minor and patch to 0: `2.0.0`

Tell the user the new version before proceeding.

## Step 4 — Check for uncommitted changes

Run `git status`. If the working tree is dirty, tell the user and ask whether to commit the changes first, stash them, or abort. Do not proceed until the tree is clean.

## Step 5 — Update package.json

Edit the `version` field in `package.json` to the new version string.

Then commit the change on the current branch:
```
git add package.json
git commit -m "claude (chore): bump version to v<new-version>"
```

## Step 6 — Merge to main

```
git checkout main
git merge --no-ff <branch-name> -m "claude (chore): merge <branch-name> into main"
```

## Step 7 — Tag main

```
git tag -a v<new-version> -m "v<new-version>"
```

Confirm the tag was created by running `git tag --list v<new-version>`.

## Step 8 — Push to origin

```
git push origin main && git push origin v<new-version>
```

## Step 9 — Summary

Tell the user:
- The branch that was merged
- The new version (`v<new-version>`)
- That main and the tag have been pushed to origin
