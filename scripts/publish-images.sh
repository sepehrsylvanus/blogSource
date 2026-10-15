#!/usr/bin/env bash
set -Eeuo pipefail

# Run on Windows from VS Code's Git Bash with Docker Desktop in Linux-containers mode.
# Authenticate first: docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin
IMAGE="${1:-}"
[[ "$IMAGE" =~ ^ghcr\.io/[a-z0-9][a-z0-9._-]*/[a-z0-9][a-z0-9._-]*$ ]] || {
  echo 'Usage: bash scripts/publish-images.sh ghcr.io/owner/repo (lowercase, no tag)' >&2
  exit 2
}
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) ;;
  *) echo 'Run this script in Windows VS Code Git Bash, not Ubuntu WSL.' >&2; exit 2 ;;
esac
cd "$(dirname "${BASH_SOURCE[0]}")/.."
[[ -z "$(git status --porcelain)" ]] || {
  echo 'Commit or discard all changes first: SHA must identify the exact source being built.' >&2
  exit 2
}
SHA="$(git rev-parse --verify HEAD)"
[[ "$SHA" =~ ^[0-9a-f]{40}$ ]] || { echo 'Expected a full Git commit SHA.' >&2; exit 2; }
[[ "$(docker info --format '{{.OSType}}')" == linux ]] || {
  echo 'Start Docker Desktop in Linux-containers mode on Windows first.' >&2
  exit 2
}
case "$(docker info --format '{{.OperatingSystem}}')" in
  *'Docker Desktop'*) ;;
  *) echo 'Build with Windows Docker Desktop, not a remote or Ubuntu Docker Engine.' >&2; exit 2 ;;
esac
# The two tags must share one commit; the server runs the two prebuilt images together.
for target in runner migrator; do
  if [[ "$target" == runner ]]; then kind=app; else kind=migrator; fi
  tag="$IMAGE:$kind-$SHA"
  docker build --platform linux/amd64 -f Dockerfile --target "$target" \
    --label "org.opencontainers.image.source=https://github.com/${IMAGE#ghcr.io/}" \
    --label "org.opencontainers.image.revision=$SHA" \
    -t "$tag" .
  docker push "$tag"
done
printf '\nPublished two linux/amd64 images. Set the GHCR package to Public before pulling on Ubuntu.\n'
printf 'IMAGE=%s\nSHA=%s\n' "$IMAGE" "$SHA"
printf 'Ubuntu: bash /srv/blog/releases/%s/deploy.sh %s %s\n' "$SHA" "$SHA" "$IMAGE"