#!/usr/bin/env python3
"""Verify a rendered page via headless Chrome's POST-JavaScript DOM, not pixels.

MathJax renders asynchronously, so screenshots taken too early look blank and
lie. This dumps the fully-rendered DOM (after a virtual-time budget) and checks:
  - 0 MathJax error nodes (<mjx-merror>)   -> all LaTeX compiled
  - 0 stray '$' left in the DOM            -> all math actually typeset (advisory)
  - every href="#id" resolves              -> no dead section links

Usage:  python verify_dom.py URL_OR_FILE [--chrome PATH]
URL_OR_FILE may be http(s):// or a local path (converted to file://).
Exits 1 if there are MathJax errors or broken links.
"""
import subprocess, sys, re, os, shutil, tempfile

CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "google-chrome", "chromium", "chromium-browser", "chrome",
]


def find_chrome(override=None):
    if override:
        return override
    for c in CANDIDATES:
        if c.endswith(".exe") or os.sep in c:
            if os.path.exists(c):
                return c
        elif shutil.which(c):
            return shutil.which(c)
    return None


def to_url(t):
    if re.match(r'^https?://', t):
        return t
    return "file:///" + os.path.abspath(t).replace("\\", "/")


def main(argv):
    target = argv[0]
    chrome = find_chrome(argv[argv.index("--chrome") + 1] if "--chrome" in argv else None)
    if not chrome:
        print("[verify_dom] no Chrome/Edge found; pass --chrome PATH"); return 2
    url = to_url(target)
    tmp = tempfile.mkdtemp()
    try:
        r = subprocess.run(
            [chrome, "--headless=new", "--no-sandbox", "--disable-gpu",
             f"--user-data-dir={tmp}", "--virtual-time-budget=9000", "--dump-dom", url],
            capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=120)
    except Exception as e:
        print("[verify_dom] chrome failed:", e); return 2
    dom = r.stdout or ""
    if len(dom) < 100:
        print("[verify_dom] empty/short DOM (load failed?)"); return 2
    merr = dom.count("mjx-merror")
    raw = len(re.findall(r'(?<!\\)\$', dom))
    ids = set(re.findall(r'\sid="([^"]+)"', dom))
    hrefs = re.findall(r'href="#([^"]+)"', dom)
    broken = sorted({h for h in hrefs if h and h not in ids})
    print(f"[verify_dom] {url}")
    print(f"  mjx-merror nodes : {merr}")
    print(f"  stray '$' in DOM : {raw}  (advisory; should be ~0 once typeset)")
    print(f"  links {len(hrefs)} / broken {len(broken)} {broken[:10]}")
    return 0 if (merr == 0 and not broken) else 1


if __name__ == "__main__":
    if not sys.argv[1:]:
        print("usage: python verify_dom.py URL_OR_FILE [--chrome PATH]"); sys.exit(2)
    sys.exit(main(sys.argv[1:]))
