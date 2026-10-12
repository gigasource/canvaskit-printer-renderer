# D-Level Steering Configuration

## Agent Rules
- Execute tasks fully autonomously until the objective is complete.
- Verify changes using the project's testing harness.
- Adhere strictly to existing coding styles and conventions.
- Make one atomic change per commit when working autonomously.
- If stuck, consult the `.d-level/tuning-log.md` for historical resolutions.

## Boundaries & Constraints
- Protected paths: `.git/`, `.idea/`, `.DS_Store`
- Avoid making destructive changes to infrastructure or sensitive production paths without explicit confirmation.
