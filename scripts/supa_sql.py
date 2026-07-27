#!/usr/bin/env python3
"""Run SQL against the Heart Beats Supabase project via the Management API.

Usage:
  python scripts/supa_sql.py path/to/migration.sql   # run a .sql file
  python scripts/supa_sql.py -q "select 1"           # run an inline query

Auth: reads the personal access token from ~/.supabase/access-token
(the same file the Supabase CLI uses).
"""
import json
import pathlib
import sys
import urllib.error
import urllib.request

PROJECT_REF = "fcamjkfgxywsyjcdmrrd"  # Rainbow Heart Studio's Project


def main():
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        sys.exit(2)

    if args[0] == "-q":
        sql = " ".join(args[1:])
        source = "(inline)"
    else:
        path = pathlib.Path(args[0])
        sql = path.read_text(encoding="utf-8")
        source = str(path)

    token_file = pathlib.Path.home() / ".supabase" / "access-token"
    token = token_file.read_text().strip()

    req = urllib.request.Request(
        f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query",
        data=json.dumps({"query": sql}).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "supa-sql/1.0 (heartbeats-practice-app tooling)",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as r:
            body = r.read().decode()
            print(f"OK ({source})")
            try:
                parsed = json.loads(body)
                print(json.dumps(parsed, indent=2, default=str)[:4000])
            except json.JSONDecodeError:
                print(body[:4000])
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code} running {source}", file=sys.stderr)
        print(e.read().decode()[:3000], file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
