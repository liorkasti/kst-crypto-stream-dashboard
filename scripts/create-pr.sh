#!/usr/bin/env bash
# Automates the mechanical parts of opening a PR (per the git-workflow
# skill): guard against PR-ing the base branch itself, idempotent
# (won't create a duplicate if one already exists), pushes the branch
# on first use. PR *content* is intentionally not auto-generated here —
# `--fill` pulls title/body from your commit messages, which is why
# writing a real Context/Decisions body into commits pays off later.
#
# Usage: scripts/create-pr.sh [base-branch]   (default base: main)
set -euo pipefail

base="${1:-main}"
branch="$(git branch --show-current)"

if [ "$branch" = "$base" ]; then
  echo "On '$base' — nothing to PR. Checkout a feature branch first." >&2
  exit 1
fi

existing="$(gh pr list --head "$branch" --json url --jq '.[0].url' 2>/dev/null || true)"
if [ -n "$existing" ]; then
  echo "PR already exists for '$branch': $existing"
  exit 0
fi

if ! git rev-parse --abbrev-ref --symbolic-full-name '@{u}' >/dev/null 2>&1; then
  echo "Pushing '$branch' to origin (first push)..."
  git push -u origin "$branch"
fi

gh pr create --base "$base" --head "$branch" --fill
