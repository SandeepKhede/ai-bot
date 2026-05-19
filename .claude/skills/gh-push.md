# gh-push

Push current work to GitHub with a phase-aware commit message.

## Usage

```
/gh-push [phase] [description]
```

Examples:
- `/gh-push` — auto-detect phase from staged changes
- `/gh-push 3 reservation flow with Redis session management`
- `/gh-push 4 AI fallback layer with OpenAI GPT-4o-mini`

## What this skill does

1. Runs `git status` to see what's changed
2. Stages all changes (excluding `.env` and other gitignored files)
3. Builds a commit message in the format:
   ```
   feat(phase-N): <description>
   
   - <bullet summary of key files changed>
   - <what was built/fixed>
   ```
4. Commits and pushes to `origin main` (or `origin master`)
5. Reports the commit hash and GitHub URL

## Instructions for Claude

When the user invokes `/gh-push`:

1. Run `git status` and `git diff --stat HEAD` to understand what changed.

2. If phase/description args were provided, use them. Otherwise:
   - Infer the phase number from changed files (e.g., `reservation-handler.ts` → Phase 3, `ai/` → Phase 4)
   - Generate a short description from the diff

3. Stage files:
   ```bash
   git add -A
   ```
   (`.env` is gitignored so it won't be included)

4. Build the commit message:
   ```
   feat(phase-N): <description>
   
   Phase N — <Phase Name>
   
   - bullet 1
   - bullet 2
   - bullet 3
   ```

   Phase names:
   - Phase 1: WhatsApp webhook plumbing
   - Phase 2: Database schema & FAQ engine  
   - Phase 3: Reservation flow & session management
   - Phase 4: AI fallback layer
   - Phase 5: Message router assembly
   - Phase 6: Admin portal
   - Phase 7: Human handoff
   - Phase 8: BullMQ queue

5. Commit:
   ```bash
   git commit -m "<message>"
   ```

6. Push:
   ```bash
   git push origin master
   ```
   (or `main` — check which branch is active first with `git branch`)

7. Report: show the short commit hash (`git log --oneline -1`) and the GitHub repo URL.

## Notes

- Never commit `.env` — it's gitignored
- Always include `CLAUDE.md` and `.claude/skills/` in commits
- If push fails due to diverged history, report the error and ask the user before force-pushing
- If there's nothing to commit, say so clearly
