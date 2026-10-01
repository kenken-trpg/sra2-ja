#!/bin/sh
# Enable this fork's local push guardrail in the current clone.
#
#   npm run setup:hooks       (or: sh tools/git-hooks/install.sh)
#
# Git does not distribute hooks or local config with a clone, so every clone
# has to opt in once. Everything set here is --local: no global config and no
# other repository is touched.
set -e

cd "$(git rev-parse --show-toplevel)"

existing=$(git config --local --get core.hooksPath || true)
if [ -n "$existing" ] && [ "$existing" != "tools/git-hooks" ]; then
  echo "core.hooksPath is already set to '$existing'." >&2
  echo "Refusing to overwrite it. Move those hooks into tools/git-hooks/ first." >&2
  exit 1
fi

# Warn rather than silently shadow: with core.hooksPath set, .git/hooks is
# ignored entirely, so any hook left there stops running.
orphans=$(ls .git/hooks 2>/dev/null | grep -v '\.sample$' || true)
if [ -n "$orphans" ]; then
  echo "note: these hooks in .git/hooks will no longer run:" >&2
  echo "$orphans" | sed 's/^/        /' >&2
fi

git config --local core.hooksPath tools/git-hooks
git config --local push.default nothing
git config --local push.followTags false

# The author's repository is read-only for this fork.
if git remote get-url upstream >/dev/null 2>&1; then
  git config --local remote.upstream.pushurl no_push
fi

# With three remotes, `gh` asks which repository to work with and remembers the
# answer -- or resolves to the author's repository on its own, which would send
# `gh pr create` and `gh issue create` upstream. Pin it to this fork, but only
# when origin really is the fork: in a clone of upstream, "base" would mean the
# author's repository and make things worse.
if [ -z "$(git config --local --get remote.origin.gh-resolved || true)" ]; then
  case "$(git remote get-url origin 2>/dev/null || true)" in
    *kenken-trpg/sra2-ja*)
      git config --local remote.origin.gh-resolved base
      ;;
    *)
      echo "note: origin is not kenken-trpg/sra2-ja, so the gh default repo was left alone." >&2
      echo "      Set it yourself with: gh repo set-default <owner>/<repo>" >&2
      ;;
  esac
fi

echo "push guardrail enabled:"
echo "  core.hooksPath        = $(git config --local core.hooksPath)"
echo "  push.default          = $(git config --local push.default)"
echo "  push.followTags       = $(git config --local push.followTags)"
echo "  remote.upstream.push  = $(git config --local remote.upstream.pushurl || echo '(no upstream remote)')"
echo "  gh default repo       = $(git config --local remote.origin.gh-resolved || echo '(not set)')"
echo
echo "Allow list and the local-only branches live in tools/git-hooks/pre-push."
