#!/usr/bin/env python3
"""
render.py — Playwright-driven rendering for the BMAD portfolio.

Two payoffs from one Playwright install:
  - PDF generation: resume-source/resume.html → Deepesh_Rathod_Resume.pdf (A4)
  - UI/UX testing: full-page screenshots of every cover at desktop + mobile

Usage
-----
  python3 scripts/render.py pdf          # regenerate the canonical resume PDF
  python3 scripts/render.py screenshots  # capture all 4 covers × 2 viewports
  python3 scripts/render.py all          # both

Screenshots require ./serve.sh running on 127.0.0.1:4173.
PDF generation is self-contained (uses a file:// URL).

This script is a dev-time tool. It is NOT loaded by the deployed site.
The boring-markdown contract (one HTML + one CSS + one JS) is unchanged.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sys.exit(
        "playwright not installed. Run:\n"
        "  pip3 install --user playwright && python3 -m playwright install chromium"
    )


# ---------- Paths ----------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
RESUME_HTML = ROOT / "resume-source" / "resume.html"
RESUME_PDF = ROOT / "Deepesh_Rathod_Resume.pdf"
SCREENSHOTS_DIR = ROOT / "_bmad-output" / "screenshots"


# ---------- Config ---------------------------------------------------

SERVER_BASE = "http://127.0.0.1:4173"

DESKTOP_VIEWPORT = {"width": 1280, "height": 900}
MOBILE_VIEWPORT = {"width": 390, "height": 844}

COVER_PAGES = [
    ("home", "/"),
    ("founder", "/founder.html"),
    ("leader", "/leader.html"),
    ("recruiter", "/recruiter.html"),
    # Article views (hash-routed via the SPA) — verify tile-mode rendering.
    ("article-manifesto-tiles", "/#manifesto"),
    ("article-blueprints-tiles", "/#blueprints"),
]


# ---------- PDF ------------------------------------------------------


def render_pdf() -> None:
    if not RESUME_HTML.exists():
        sys.exit(f"resume.html not found at {RESUME_HTML}")
    file_url = RESUME_HTML.as_uri()
    print(f"[pdf] rendering {file_url}")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(file_url, wait_until="networkidle")
        # prefer_css_page_size=True honours the @page rule in resume.css
        # (A4 + the 14mm/16mm margins defined there). Setting margin to 0
        # here so the @page margins are not stacked on top.
        page.pdf(
            path=str(RESUME_PDF),
            format="A4",
            print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
            prefer_css_page_size=True,
        )
        browser.close()
    size_kb = RESUME_PDF.stat().st_size // 1024
    print(f"[pdf] wrote {RESUME_PDF.name}  ({size_kb} KB)")


# ---------- Screenshots ----------------------------------------------


def _check_server() -> bool:
    """Cheap reachability check: try to fetch /."""
    import urllib.request
    import urllib.error
    try:
        urllib.request.urlopen(SERVER_BASE + "/", timeout=2).read(1)
        return True
    except (urllib.error.URLError, TimeoutError, ConnectionResetError):
        return False


def render_screenshots() -> None:
    if not _check_server():
        sys.exit(
            f"server unreachable at {SERVER_BASE}. Start it first:\n"
            f"  ./serve.sh"
        )
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    print(f"[ss] writing to {SCREENSHOTS_DIR}")
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for label, path in COVER_PAGES:
            url = SERVER_BASE + path
            for tag, viewport in (
                ("desktop", DESKTOP_VIEWPORT),
                ("mobile", MOBILE_VIEWPORT),
            ):
                ctx = browser.new_context(
                    viewport=viewport,
                    device_scale_factor=2,
                )
                page = ctx.new_page()
                try:
                    page.goto(url, wait_until="networkidle", timeout=15000)
                except Exception as e:
                    print(f"[!] {url} ({tag}): {e}")
                    ctx.close()
                    continue
                out = SCREENSHOTS_DIR / f"{label}-{tag}.png"
                page.screenshot(path=str(out), full_page=True)
                size_kb = out.stat().st_size // 1024
                print(f"[ss] {label:9s} {tag:7s} → {out.name}  ({size_kb} KB)")
                ctx.close()
        browser.close()


# ---------- CLI ------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser(
        description="BMAD portfolio renderer — PDF + screenshots via Playwright."
    )
    parser.add_argument(
        "cmd",
        choices=["pdf", "screenshots", "all"],
        help="What to render.",
    )
    args = parser.parse_args()
    if args.cmd in ("pdf", "all"):
        render_pdf()
    if args.cmd in ("screenshots", "all"):
        render_screenshots()


if __name__ == "__main__":
    main()
