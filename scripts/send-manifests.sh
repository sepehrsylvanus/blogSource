#!/usr/bin/env bash
set -Eeuo pipefail

# Run ONLY in Windows VS Code Git Bash on the SAME PC as the Ubuntu WSL distro.
# Send two deployment files; never copy the app source, credentials or Dockerfile.
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*) ;;
  *) echo 'Run in Windows Git Bash, not Ubuntu.' >&2; exit 2 ;;
esac
DISTRO="${1:-}"
[[ "$DISTRO" =~ ^[a-zA-Z0-9._-]+$ ]] || {
  echo 'Usage: bash scripts/send-manifests.sh Ubuntu-24.04 (use your actual WSL distro name)' >&2
  exit 2
}
cd "$(dirname "${BASH_SOURCE[0]}")/.."
[[ -z "$(git status --porcelain)" ]] || {
  echo 'Commit changes first; manifest release must match the published image SHA.' >&2
  exit 2
}
SHA="$(git rev-parse --verify HEAD)"
[[ "$SHA" =~ ^[0-9a-f]{40}$ ]] || { echo 'Expected a full Git commit SHA.' >&2; exit 2; }
DIR="/srv/blog/releases/$SHA"
# Prevent Git Bash/MSYS from changing Linux /srv paths into Windows paths.
MSYS_NO_PATHCONV=1 wsl.exe -d "$DISTRO" -u deploy -- install -d -m 700 "$DIR"
MSYS_NO_PATHCONV=1 wsl.exe -d "$DISTRO" -u deploy -- tee "$DIR/compose.prod.yml" < compose.prod.yml > /dev/null
MSYS_NO_PATHCONV=1 wsl.exe -d "$DISTRO" -u deploy -- tee "$DIR/deploy.sh" < scripts/deploy.sh > /dev/null
# If a Windows editor saved CRLF, normalize only the two Linux deployment files.
MSYS_NO_PATHCONV=1 wsl.exe -d "$DISTRO" -u deploy -- sed -i 's/\r$//' "$DIR/compose.prod.yml" "$DIR/deploy.sh"
MSYS_NO_PATHCONV=1 wsl.exe -d "$DISTRO" -u deploy -- chmod 600 "$DIR/compose.prod.yml"
MSYS_NO_PATHCONV=1 wsl.exe -d "$DISTRO" -u deploy -- chmod 700 "$DIR/deploy.sh"
MSYS_NO_PATHCONV=1 wsl.exe -d "$DISTRO" -u deploy -- bash -n "$DIR/deploy.sh"
MSYS_NO_PATHCONV=1 wsl.exe -d "$DISTRO" -u deploy -- test -s "$DIR/compose.prod.yml"
printf 'Sent ONLY compose.prod.yml and deploy.sh to %s:%s\n' "$DISTRO" "$DIR"
printf 'Open Ubuntu as deploy; run the release with SHA=%s after BOTH GHCR images are public.\n' "$SHA"