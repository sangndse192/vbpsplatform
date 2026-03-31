@AGENTS.md

## QA Feedback Workflow

QA team uses Agentation toolbar on dev server to annotate bugs.
Each annotation auto-creates a GitHub Issue with label `qa-feedback`.

### Handling QA feedback:

1. Search GitHub issues with label "qa-feedback" and state "open"
2. For each issue:
   - Read **Element** (CSS selector) → grep codebase
   - Read **React Component** → find in src/
   - Read **Source File** → open directly
   - Read **Computed Styles** → understand current CSS
   - Fix bug per QA comment
   - Commit: "fix: [description] (closes #XX)"
3. If unclear, comment on the issue to ask QA

### Labels:
- `qa-feedback` — all annotations from QA
- `bug` — feedback annotation (needs fix)
- `enhancement` — placement/rearrange (layout change)
- `batch` — multiple annotations submitted together
