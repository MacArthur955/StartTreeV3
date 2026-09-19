#!/bin/sh
set -eu

missing=0

for tool in node npm just; do
    if command -v "$tool" >/dev/null 2>&1; then
        version=$($tool --version)
        printf '%s: installed (%s)\n' "$tool" "$version"
    else
        printf '%s: missing\n' "$tool"
        missing=1
    fi
done

if [ "$missing" -ne 0 ]; then
    printf '\nInstall the missing tools, then run just init again.\n' >&2
    exit 1
fi

printf '\nInstalling project dependencies with npm ci...\n'
npm ci
