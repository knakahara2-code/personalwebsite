# Git Workflow

This project targets non-engineers. Git mistakes = lost work. Follow these rules strictly.

## Commit Frequently

- Commit after every meaningful change (new component, feature working, bug fixed)
- Never let more than ~30 minutes of work go uncommitted
- Commit BEFORE making risky changes (large refactors, dependency updates, config changes)
- Use clear Japanese-friendly commit messages: `ログイン機能を追加` or `Add login feature`

## Never Do These

- **Never `git push --force`** — this destroys remote history
- **Never `git reset --hard`** without confirming with the user — this deletes uncommitted work
- **Never `git checkout .`** or `git restore .`** to discard all changes without asking
- **Never delete branches** without asking — they might contain work in progress
- **Never `git clean -f`** — this permanently removes untracked files

## Branch Strategy

- **Use `main` only** for MVP/personal projects — branching adds complexity non-engineers don't need
- Create a branch only when the user explicitly asks, or when experimenting with something risky
- If branching: `feature/short-description` format, merge back to main quickly

## Recovery Patterns

When things go wrong, use these safe recovery methods:

### "I want to undo the last commit" (keep changes)
```bash
git reset --soft HEAD~1
```

### "Something broke, what changed?"
```bash
git diff           # unstaged changes
git diff --staged  # staged changes
git log --oneline -5  # recent commits
```

### "I want to go back to how it was"
```bash
git stash          # temporarily save current changes
git stash pop      # bring them back later
```

### "A file got messed up, restore just that file"
```bash
git checkout HEAD -- path/to/file.tsx
```

## Before Destructive Operations

Always show the user what will happen:
1. Run `git status` and `git diff` first
2. Explain in Japanese what will change
3. Get explicit confirmation before proceeding

## .gitignore Essentials

These must always be gitignored (already configured in template):
- `.env.local` — secrets and API keys
- `node_modules/` — dependencies (reinstallable)
- `.next/` — build output
- `.claude/settings.local.json` — Claude Code local settings
