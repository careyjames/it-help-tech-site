#!/usr/bin/env bash
# externalises the last inline <style> block in templates/partials/head.html
# into sass/critical-inline.scss, adds a <link> tag, and verifies the Zola build
set -euo pipefail

HEAD="templates/partials/head.html"
CRITICAL_SCSS="sass/critical-inline.scss"

[[ -f "$HEAD" ]] || { echo "Error: $HEAD not found" >&2; exit 1; }

backup="$HEAD.bak-$(date +%Y%m%d-%H%M%S)"
cp "$HEAD" "$backup"

# locate the final <style>…</style> pair
start=$(grep -n "<style" "$HEAD" | tail -1 | cut -d: -f1 || true)
[[ -z "$start" ]] && { echo "No inline <style> block found — nothing to do."; exit 0; }
end=$(awk -v s="$start" 'NR>=s && /<\/style>/{print NR; exit}' "$HEAD")

# extract w/o wrapper lines → SCSS
sed -n "${start},${end}p" "$HEAD" | sed '1d;$d' > "$CRITICAL_SCSS"

# remove the block from head.html
sed -i.bak "${start},${end}d" "$HEAD"
rm -f "$HEAD.bak"

# inject <link> after preload group, before first <noscript>
awk -v tag='<link rel="stylesheet" href="{{ get_url(path="css/critical-inline.css") | safe }}">' '
  /<link[^>]*preload[^>]*as="style"/ { seen=1 }
  seen && /<noscript>/ && !done {
      match($0,/^[ \t]*/); print; printf "%s%s\n", substr($0,1,RSTART-1), tag;
      done=1; next
  }
  { print }
' "$HEAD" > "$HEAD.tmp" && mv "$HEAD.tmp" "$HEAD"

# verify build
command -v zola >/dev/null || { echo "Error: zola not installed"; mv "$backup" "$HEAD"; exit 1; }
if ! zola build >/dev/null; then
    echo "Error: zola build failed — reverted."; mv "$backup" "$HEAD"; exit 1;
fi

printf '✓ Extracted inline CSS to %s and updated %s\n' "$CRITICAL_SCSS" "$HEAD"
