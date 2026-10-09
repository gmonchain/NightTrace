# Taste

## Communication

- Writes in Vietnamese and expects replies in Vietnamese (the assistant mirrored the language). Confidence: 0.7

## Workflow

- Hands off work with a terse Vietnamese go-ahead plus a slash command (e.g. "ok làm đi /goal") rather than a detailed brief, and expects the agent to pick the next undone item itself and run the whole cycle (plan → implement → review → commit) autonomously without stopping for approval mid-way. Confidence: 0.6
- Expects every status/tracking artifact to reflect completion, not just the story's own spec — a tracker left at an earlier state (e.g. `sprint-status.yaml` still `review`/`backlog`) reads to them as work not actually finished. Confidence: 0.55
