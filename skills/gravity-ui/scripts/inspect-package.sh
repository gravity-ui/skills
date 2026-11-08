#!/usr/bin/env bash
set -euo pipefail

# Bounded look at an installed @gravity-ui package: resolved version, bundled docs, and the .d.ts files
# that declare the given symbols. Run from the project root.
#   inspect-package.sh <package> [Symbol ...]      e.g. inspect-package.sh uikit Button Dialog

pkg="${1:-}"
shift || true

if [[ -z "$pkg" ]]; then
  echo "usage: inspect-package.sh <gravity-package> [Symbol ...]" >&2
  exit 2
fi

root="node_modules/@gravity-ui/$pkg"
manifest="$root/package.json"
if [[ ! -f "$manifest" ]]; then
  echo "missing installed package: @gravity-ui/$pkg" >&2
  exit 1
fi

node -e 'const p=require(process.argv[1]); console.log(`package=@gravity-ui/${p.name.split("/").pop()} version=${p.version}`)' "./$manifest"

for doc in "$root/dist/docs/INDEX.md" "$root/build/docs/INDEX.md" "$root/README.md"; do
  [[ -s "$doc" ]] && echo "doc=$doc"
done

# Declaration files that define or export each symbol (ripgrep when available, grep otherwise).
find_decl() {
  local pattern="$1"
  if command -v rg >/dev/null 2>&1; then
    rg -l --glob '*.d.ts' "$pattern" "$root/dist" "$root/build" 2>/dev/null
  else
    grep -rlE --include='*.d.ts' "$pattern" "$root/dist" "$root/build" 2>/dev/null
  fi
}

for symbol in "$@"; do
  echo "symbol=$symbol"
  find_decl "(declare (const|function|class) $symbol|interface ${symbol}Props|type ${symbol}Props|export .*\\b$symbol\\b)" | sed -n '1,8p' || true
done
