#!/usr/bin/env python3
"""Check MathJax delimiter balance in an HTML (or Markdown) file.

Scans the file as a state machine: $$ toggles display math, $ toggles inline.
Flags: $$ opened inside inline math, single $ inside display, EOF mid-math,
and per-segment {} / \\left-\\right / \\begin-\\end imbalance and stray \\boxed.

Usage:  python checktex.py FILE.html
Exits 1 if any issue is found, 0 otherwise.
"""
import re, sys


def main(path):
    s = open(path, encoding="utf-8").read()
    state = "text"  # text | inline | display
    i = 0; line = 1
    issues = []; segments = []; seg_start = None; buf = ""
    while i < len(s):
        ch = s[i]
        if ch == "\n":
            line += 1
        if s[i:i + 2] == "$$":
            if state == "text":
                state = "display"; seg_start = line; buf = ""
            elif state == "display":
                segments.append(("display", seg_start, buf)); state = "text"
            else:
                issues.append(f"line {line}: '$$' inside INLINE math (started line {seg_start})")
                state = "text"
            i += 2; continue
        if ch == "$":
            if state == "text":
                state = "inline"; seg_start = line; buf = ""
            elif state == "inline":
                segments.append(("inline", seg_start, buf)); state = "text"
            else:
                issues.append(f"line {line}: single '$' inside DISPLAY math (started line {seg_start})")
            i += 1; continue
        if state != "text":
            buf += ch
        i += 1
    if state != "text":
        issues.append(f"EOF: still open in {state} math (started line {seg_start})")

    for mode, ln, body in segments:
        if body.count("{") != body.count("}"):
            issues.append(f"line {ln} ({mode}): brace imbalance :: {body[:60]!r}")
        if body.count(r"\left") != body.count(r"\right"):
            issues.append(f"line {ln} ({mode}): \\left/\\right imbalance :: {body[:60]!r}")
        if body.count(r"\begin") != body.count(r"\end"):
            issues.append(f"line {ln} ({mode}): \\begin/\\end imbalance :: {body[:60]!r}")
        for m in re.finditer(r"\\boxed(.?)", body):
            if m.group(1) != "{":
                issues.append(f"line {ln} ({mode}): \\boxed not followed by '{{' :: {body[:60]!r}")

    print(f"[checktex] {path}: {len(segments)} math segment(s), {len(issues)} issue(s)")
    for x in issues:
        print("  -", x)
    return 1 if issues else 0


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: python checktex.py FILE.html"); sys.exit(2)
    sys.exit(main(sys.argv[1]))
