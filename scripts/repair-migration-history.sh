#!/bin/sh
# Make supabase_migrations.schema_migrations match supabase/migrations/ WITHOUT touching the schema or data.
#
# Why the history drifted: Lovable stores each migration remotely under a version 1-2 s off from the
# local file name (remote 20251031104349 = local 20251031104350). Both are the same, already applied SQL.
#
# What this does (history rows only, no SQL from the migrations is executed):
#   1. remote-only versions that have a local twin   -> repair --status reverted (drop the duplicate row)
#   2. local-only versions (already applied by hand)  -> repair --status applied  (record them)
#   Kept out: PENDING (genuinely new migrations), which `supabase db push` then applies normally.
#
# Usage: sh scripts/repair-migration-history.sh            # dry run: prints the plan
#        sh scripts/repair-migration-history.sh --apply    # performs it
set -e
PLAN=$(mktemp)
cd "$(dirname "$0")/.."
SB=${SUPABASE_BIN:-supabase}
PENDING="20261105100000"

$SB migration list --linked --output-format json 2>/dev/null | python3 -c '
import json, sys
pending = set(sys.argv[1].split())
rows = json.load(sys.stdin)["migrations"]
remote_only = [r["remote"] for r in rows if r["remote"] and not r["local"]]
local_only = [r["local"] for r in rows if r["local"] and not r["remote"] and r["local"] not in pending]
print("REVERT " + " ".join(remote_only))
print("APPLY " + " ".join(local_only))
' "$PENDING" > "$PLAN"

REVERT=$(sed -n 's/^REVERT //p' "$PLAN")
APPLY=$(sed -n 's/^APPLY //p' "$PLAN")
echo "remote-only rows to drop (duplicates): $(echo $REVERT | wc -w)"
echo "local files to record as applied:      $(echo $APPLY | wc -w)"
echo "left pending for db push:              $PENDING"

if [ "$1" != "--apply" ]; then
  echo "Dry run. Re-run with --apply to change the history table."
  exit 0
fi
[ -n "$REVERT" ] && $SB migration repair --linked --status reverted $REVERT
[ -n "$APPLY" ] && $SB migration repair --linked --status applied $APPLY
echo "Done. Check: $SB db push --linked --dry-run   (should list only $PENDING)"
