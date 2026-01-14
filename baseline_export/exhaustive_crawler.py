#!/usr/bin/env python3
"""
OMEGA Dashboard Exhaustive UI Crawler

This script captures screenshots across all UI states, routes, modals, tabs, and tools
for both dark/light themes and desktop/mobile breakpoints.

Requirements:
    pip install playwright
    playwright install chromium

Usage:
    python exhaustive_crawler.py --base-url http://localhost:3000

Output:
    Screenshots saved to: ./desktop_dark/, ./desktop_light/, ./mobile_dark/, ./mobile_light/
    Coverage report: ./COVERAGE_REPORT.json
"""

import asyncio
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional

# Install playwright if needed
try:
    from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
except ImportError:
    print("Installing playwright...")
    os.system("pip install playwright && playwright install chromium")
    from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout


# Configuration
BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
OUTPUT_DIR = Path(__file__).parent
SCREENSHOT_QUALITY = 80  # JPEG quality
TIMEOUT = 10000  # 10 seconds for most operations
MODAL_WAIT = 500  # Wait after modal opens

# Breakpoints
BREAKPOINTS = {
    "desktop": {"width": 1440, "height": 900},
    "mobile": {"width": 390, "height": 844},  # iPhone 14 Pro
}

# Themes
THEMES = ["dark", "light"]

# Screenshot counter for unique naming
screenshot_counter = {}

# Tracking
exercised = []
failures = []


def get_screenshot_id(prefix: str, folder: str) -> str:
    """Generate unique screenshot ID with sequential numbering"""
    key = f"{folder}_{prefix}"
    if key not in screenshot_counter:
        screenshot_counter[key] = 0
    screenshot_counter[key] += 1
    return f"{screenshot_counter[key]:04d}_{prefix}"


async def safe_click(page, selector: str, timeout: int = TIMEOUT) -> bool:
    """Safely click an element, returning success status"""
    try:
        elem = page.locator(selector).first
        await elem.wait_for(state="visible", timeout=timeout)
        await elem.click()
        await page.wait_for_timeout(300)
        return True
    except PlaywrightTimeout:
        return False
    except Exception as e:
        print(f"    Click error on {selector}: {e}")
        return False


async def safe_screenshot(page, folder: str, name: str, full_page: bool = False) -> str:
    """Take screenshot with error handling and immediate persistence"""
    folder_path = OUTPUT_DIR / folder
    folder_path.mkdir(parents=True, exist_ok=True)
    
    screenshot_id = get_screenshot_id(name, folder)
    filepath = folder_path / f"{screenshot_id}.jpg"
    
    try:
        await page.screenshot(
            path=str(filepath),
            type="jpeg",
            quality=SCREENSHOT_QUALITY,
            full_page=full_page
        )
        print(f"    ✓ Saved: {filepath.name}")
        return screenshot_id
    except Exception as e:
        print(f"    ✗ Screenshot failed: {e}")
        return None


async def set_theme(page, theme: str) -> None:
    """Set the theme by clicking the theme toggle button"""
    # Check current theme
    current_theme = await page.evaluate("() => localStorage.getItem('omega-theme') || 'dark'")
    
    if current_theme != theme:
        # Click theme toggle
        toggle = page.locator("[data-testid='theme-toggle-btn']")
        if await toggle.is_visible():
            await toggle.click()
            await page.wait_for_timeout(500)
            print(f"    Theme switched to {theme}")
    else:
        print(f"    Theme already {theme}")


async def close_all_modals(page) -> None:
    """Close any open modals by pressing Escape and clicking outside"""
    for _ in range(3):  # Try multiple times
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(200)


async def capture_home_states(page, folder: str) -> None:
    """Capture home dashboard states"""
    print(f"  Home Dashboard ({folder})...")
    
    # Default state
    await page.goto(f"{BASE_URL}/#/")
    await page.wait_for_timeout(1000)
    sid = await safe_screenshot(page, folder, "home_default")
    if sid:
        exercised.append({"id": sid, "route": "/", "state": "default", "folder": folder})
    
    # Scroll to bottom
    await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    await page.wait_for_timeout(500)
    sid = await safe_screenshot(page, folder, "home_bottom")
    if sid:
        exercised.append({"id": sid, "route": "/", "state": "scrolled", "folder": folder})
    
    # Scroll back up
    await page.evaluate("window.scrollTo(0, 0)")
    await page.wait_for_timeout(300)


async def capture_modal(page, folder: str, btn_selector: str, modal_name: str, 
                        close_selector: Optional[str] = None, 
                        tabs: list = None) -> None:
    """Capture a modal and optionally its tabs"""
    print(f"    {modal_name}...")
    
    # Click to open
    if not await safe_click(page, btn_selector):
        failures.append({
            "id": modal_name.lower().replace(" ", "_"),
            "reason": f"Button {btn_selector} not found or not clickable",
            "folder": folder
        })
        return
    
    await page.wait_for_timeout(MODAL_WAIT)
    
    # Capture modal default state
    sid = await safe_screenshot(page, folder, f"modal_{modal_name.lower().replace(' ', '_')}")
    if sid:
        exercised.append({"id": sid, "route": "/", "modal": modal_name, "folder": folder})
    
    # Capture tabs if specified
    if tabs:
        for tab in tabs:
            tab_id = tab.get("id")
            tab_selector = tab.get("selector")
            tab_name = tab.get("name", tab_id)
            
            if await safe_click(page, tab_selector, timeout=3000):
                await page.wait_for_timeout(400)
                sid = await safe_screenshot(page, folder, f"modal_{modal_name.lower().replace(' ', '_')}_{tab_id}")
                if sid:
                    exercised.append({
                        "id": sid, "route": "/", "modal": modal_name, 
                        "tab": tab_name, "folder": folder
                    })
            else:
                failures.append({
                    "id": f"{modal_name.lower()}_{tab_id}",
                    "reason": f"Tab selector {tab_selector} not found",
                    "folder": folder
                })
    
    # Close modal
    if close_selector:
        await safe_click(page, close_selector, timeout=2000)
    else:
        await close_all_modals(page)
    
    await page.wait_for_timeout(300)


async def capture_tools(page, folder: str) -> None:
    """Capture all quick tools modals"""
    tools = [
        {"id": "quickguide", "name": "Quick Guide"},
        {"id": "calculator", "name": "Calculator"},
        {"id": "translator", "name": "Translator"},
        {"id": "sos", "name": "SOS Beacon"},
        {"id": "currency", "name": "Currency"},
        {"id": "dictionary", "name": "Dictionary"},
        {"id": "notes", "name": "Field Notes"},
    ]
    
    print(f"  Quick Tools ({folder})...")
    
    for tool in tools:
        selector = f"[data-testid='tool-{tool['id']}']"
        print(f"    {tool['name']}...")
        
        if await safe_click(page, selector):
            await page.wait_for_timeout(MODAL_WAIT)
            sid = await safe_screenshot(page, folder, f"tool_{tool['id']}")
            if sid:
                exercised.append({
                    "id": sid, "route": "/", "modal": tool['name'], "folder": folder
                })
            await close_all_modals(page)
        else:
            failures.append({
                "id": f"tool_{tool['id']}",
                "reason": f"Tool button {selector} not found",
                "folder": folder
            })
        
        await page.wait_for_timeout(200)


async def capture_entertainment(page, folder: str) -> None:
    """Capture entertainment page and all tabs"""
    print(f"  Entertainment Page ({folder})...")
    
    # Navigate to entertainment
    await page.goto(f"{BASE_URL}/#/entertainment")
    await page.wait_for_timeout(1000)
    
    tabs = [
        {"id": "overview", "name": "Overview"},
        {"id": "movies", "name": "Movies & TV"},
        {"id": "games", "name": "Games"},
        {"id": "music", "name": "Music"},
        {"id": "photos", "name": "Photos"},
        {"id": "vault", "name": "Vault"},
        {"id": "share", "name": "File Drop"},
    ]
    
    for tab in tabs:
        selector = f"[data-testid='nav-{tab['id']}']"
        print(f"    {tab['name']}...")
        
        if await safe_click(page, selector):
            await page.wait_for_timeout(500)
            sid = await safe_screenshot(page, folder, f"ent_{tab['id']}")
            if sid:
                exercised.append({
                    "id": sid, "route": "/entertainment", "tab": tab['name'], "folder": folder
                })
        else:
            failures.append({
                "id": f"ent_{tab['id']}",
                "reason": f"Tab selector {selector} not found",
                "folder": folder
            })
    
    # Movie Night Modal (if button exists)
    movie_night_btn = page.get_by_text("Start Movie Night")
    try:
        if await movie_night_btn.is_visible(timeout=2000):
            await movie_night_btn.click()
            await page.wait_for_timeout(MODAL_WAIT)
            sid = await safe_screenshot(page, folder, "ent_movie_night_modal")
            if sid:
                exercised.append({
                    "id": sid, "route": "/entertainment", "modal": "MovieNight", "folder": folder
                })
            await close_all_modals(page)
    except:
        pass  # Button may not be visible
    
    # Return to home
    await page.goto(f"{BASE_URL}/#/")
    await page.wait_for_timeout(500)


async def capture_mobile_overflow(page, folder: str) -> None:
    """Capture mobile overflow menu"""
    if "mobile" not in folder:
        return
    
    print(f"    Mobile Overflow Menu...")
    
    overflow_btn = page.locator("[data-testid='overflow-menu-btn']")
    try:
        if await overflow_btn.is_visible(timeout=2000):
            await overflow_btn.click()
            await page.wait_for_timeout(400)
            sid = await safe_screenshot(page, folder, "overflow_menu")
            if sid:
                exercised.append({
                    "id": sid, "route": "/", "dropdown": "overflow-menu", "folder": folder
                })
            
            # Click Help Center from overflow
            help_btn = page.locator("[data-testid='overflow-help-center']")
            if await help_btn.is_visible(timeout=1000):
                await help_btn.click()
                await page.wait_for_timeout(MODAL_WAIT)
                sid = await safe_screenshot(page, folder, "modal_help_from_overflow")
                if sid:
                    exercised.append({
                        "id": sid, "route": "/", "modal": "HelpCenter", 
                        "via": "overflow", "folder": folder
                    })
                await close_all_modals(page)
            
            await close_all_modals(page)
    except Exception as e:
        failures.append({
            "id": "overflow_menu",
            "reason": f"Overflow menu not accessible: {e}",
            "folder": folder
        })


async def capture_all_for_config(page, breakpoint_name: str, theme: str) -> None:
    """Capture all states for a specific breakpoint and theme combination"""
    folder = f"{breakpoint_name}_{theme}"
    bp = BREAKPOINTS[breakpoint_name]
    
    print(f"\n{'='*60}")
    print(f"CRAWLING: {folder} ({bp['width']}x{bp['height']})")
    print(f"{'='*60}")
    
    # Set viewport
    await page.set_viewport_size({"width": bp["width"], "height": bp["height"]})
    
    # Navigate to home
    await page.goto(f"{BASE_URL}/#/")
    await page.wait_for_timeout(1000)
    
    # Set theme
    await set_theme(page, theme)
    await page.wait_for_timeout(500)
    
    # 1. Home states
    await capture_home_states(page, folder)
    
    # 2. Mobile overflow (only for mobile)
    await capture_mobile_overflow(page, folder)
    
    # 3. LOGS Modal
    btn = "[data-testid='logs-btn']" if breakpoint_name == "desktop" else "[data-testid='logs-btn-mobile']"
    await capture_modal(
        page, folder, btn, "LOGS",
        close_selector="[data-testid='logs-close']",
        tabs=[
            {"id": "this_device", "selector": "[data-testid='tab-this-device']", "name": "This Device"},
            {"id": "incidents", "selector": "[data-testid='tab-incidents']", "name": "Incidents"},
            {"id": "all_nodes", "selector": "[data-testid='tab-all-nodes']", "name": "All Nodes"},
        ]
    )
    
    # 4. Community Hub Modal
    btn = "[data-testid='community-btn']" if breakpoint_name == "desktop" else "[data-testid='community-btn-mobile']"
    await capture_modal(
        page, folder, btn, "CommunityHub",
        close_selector="[data-testid='community-close']",
        tabs=[
            {"id": "overview", "selector": "[data-testid='tab-overview']", "name": "Overview"},
            {"id": "analytics", "selector": "[data-testid='tab-analytics']", "name": "Analytics"},
            {"id": "directory", "selector": "[data-testid='tab-directory']", "name": "Directory"},
            {"id": "comms", "selector": "[data-testid='tab-comms']", "name": "Comms"},
        ]
    )
    
    # 5. Help Center (desktop only for full version, mobile via overflow)
    if breakpoint_name == "desktop":
        await capture_modal(
            page, folder, "[data-testid='help-center-btn']", "HelpCenter",
            close_selector="[data-testid='help-center-close']"
        )
    
    # 6. Admin Console Modal
    await capture_modal(
        page, folder, "[data-testid='admin-console-btn']", "AdminConsole",
        tabs=[
            {"id": "fleet", "selector": "[data-testid='admin-section-fleet']", "name": "Fleet"},
            {"id": "roster", "selector": "[data-testid='admin-section-roster']", "name": "Roster"},
            {"id": "broadcast", "selector": "[data-testid='admin-section-broadcast']", "name": "Broadcast"},
        ]
    )
    
    # Close admin modal before capturing audit
    await close_all_modals(page)
    await page.wait_for_timeout(300)
    
    # 7. Admin Console - Audit Panel (separate modal)
    print(f"    Admin Audit Panel...")
    # Open admin first, then click audit
    if await safe_click(page, "[data-testid='admin-console-btn']"):
        await page.wait_for_timeout(MODAL_WAIT)
        if await safe_click(page, "[data-testid='admin-section-audit']"):
            await page.wait_for_timeout(MODAL_WAIT)
            sid = await safe_screenshot(page, folder, "modal_admin_audit")
            if sid:
                exercised.append({
                    "id": sid, "route": "/", "modal": "AdminConsole", 
                    "panel": "Audit", "folder": folder
                })
        await close_all_modals(page)
    
    # 8. System Status Panel
    await capture_modal(
        page, folder, "[data-testid='system-status-btn']", "SystemStatus"
    )
    
    # 9. Quick Tools (desktop only for efficiency, represents all themes)
    if breakpoint_name == "desktop" and theme == "dark":
        await capture_tools(page, folder)
    
    # 10. Entertainment Page
    await capture_entertainment(page, folder)
    
    print(f"\n  ✓ Completed {folder}")


async def run_crawler():
    """Main crawler execution"""
    print("\n" + "="*60)
    print("OMEGA DASHBOARD EXHAUSTIVE CRAWLER")
    print(f"Base URL: {BASE_URL}")
    print(f"Output: {OUTPUT_DIR}")
    print(f"Started: {datetime.now().isoformat()}")
    print("="*60)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # Configure console logging
        page.on("console", lambda msg: None)  # Suppress console logs
        
        # Crawl all combinations
        for bp_name in ["desktop", "mobile"]:
            for theme in THEMES:
                try:
                    await capture_all_for_config(page, bp_name, theme)
                except Exception as e:
                    print(f"\n  ✗ FAILED {bp_name}_{theme}: {e}")
                    failures.append({
                        "id": f"{bp_name}_{theme}_crawl",
                        "reason": str(e),
                        "folder": f"{bp_name}_{theme}"
                    })
        
        await browser.close()
    
    # Generate coverage report
    generate_coverage_report()
    
    print("\n" + "="*60)
    print("CRAWL COMPLETE")
    print(f"Total screenshots: {sum(len(list((OUTPUT_DIR / f).glob('*.jpg'))) for f in ['desktop_dark', 'desktop_light', 'mobile_dark', 'mobile_light'] if (OUTPUT_DIR / f).exists())}")
    print(f"Exercised: {len(exercised)}")
    print(f"Failures: {len(failures)}")
    print("="*60 + "\n")


def generate_coverage_report():
    """Generate COVERAGE_REPORT.json"""
    
    # Count screenshots per folder
    counts = {}
    for folder in ["desktop_dark", "desktop_light", "mobile_dark", "mobile_light"]:
        folder_path = OUTPUT_DIR / folder
        if folder_path.exists():
            counts[folder] = len(list(folder_path.glob("*.jpg")))
        else:
            counts[folder] = 0
    
    total = sum(counts.values())
    
    report = {
        "generatedAt": datetime.now().isoformat() + "Z",
        "total_discovered": len(exercised) + len(failures),
        "total_exercised": len(exercised),
        "total_failed": len(failures),
        "screenshotCounts": counts,
        "exercised": exercised,
        "failures": failures,
        "coveragePercentage": round(len(exercised) / max(len(exercised) + len(failures), 1) * 100, 1)
    }
    
    report_path = OUTPUT_DIR / "COVERAGE_REPORT.json"
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)
    
    print(f"\n  Coverage Report saved to: {report_path}")


def update_interaction_graph():
    """Update INTERACTION_GRAPH.json with current selectors"""
    graph = {
        "generatedAt": datetime.now().isoformat() + "Z",
        "note": "Auto-generated by exhaustive_crawler.py",
        "interactionGraph": {
            "/": {
                "route": "/",
                "component": "Dashboard",
                "elements": [
                    {"id": "logs-btn", "selector": "[data-testid='logs-btn']", "type": "button", "opensModal": "LOGS"},
                    {"id": "logs-btn-mobile", "selector": "[data-testid='logs-btn-mobile']", "type": "button", "opensModal": "LOGS", "context": "mobile"},
                    {"id": "community-btn", "selector": "[data-testid='community-btn']", "type": "button", "opensModal": "CommunityHub"},
                    {"id": "community-btn-mobile", "selector": "[data-testid='community-btn-mobile']", "type": "button", "opensModal": "CommunityHub", "context": "mobile"},
                    {"id": "help-center-btn", "selector": "[data-testid='help-center-btn']", "type": "button", "opensModal": "HelpCenter"},
                    {"id": "entertainment-btn", "selector": "[data-testid='entertainment-btn']", "type": "button", "navigatesTo": "/entertainment"},
                    {"id": "admin-console-btn", "selector": "[data-testid='admin-console-btn']", "type": "button", "opensModal": "AdminConsole"},
                    {"id": "system-status-btn", "selector": "[data-testid='system-status-btn']", "type": "button", "opensModal": "SystemStatus"},
                    {"id": "theme-toggle-btn", "selector": "[data-testid='theme-toggle-btn']", "type": "button", "togglesState": "theme"},
                    {"id": "overflow-menu-btn", "selector": "[data-testid='overflow-menu-btn']", "type": "button", "opensDropdown": "overflow-menu", "context": "mobile"},
                    {"id": "language-selector", "selector": "[data-testid='language-selector']", "type": "dropdown"},
                    {"id": "tool-quickguide", "selector": "[data-testid='tool-quickguide']", "type": "button", "opensModal": "QuickGuide"},
                    {"id": "tool-calculator", "selector": "[data-testid='tool-calculator']", "type": "button", "opensModal": "Calculator"},
                    {"id": "tool-translator", "selector": "[data-testid='tool-translator']", "type": "button", "opensModal": "Translator"},
                    {"id": "tool-sos", "selector": "[data-testid='tool-sos']", "type": "button", "opensModal": "SOSBeacon"},
                    {"id": "tool-currency", "selector": "[data-testid='tool-currency']", "type": "button", "opensModal": "Currency"},
                    {"id": "tool-dictionary", "selector": "[data-testid='tool-dictionary']", "type": "button", "opensModal": "Dictionary"},
                    {"id": "tool-notes", "selector": "[data-testid='tool-notes']", "type": "button", "opensModal": "FieldNotes"},
                ]
            },
            "/entertainment": {
                "route": "/entertainment",
                "component": "EntertainmentPage",
                "elements": [
                    {"id": "back-to-dashboard", "selector": "[data-testid='back-to-dashboard']", "type": "button", "navigatesTo": "/"},
                    {"id": "nav-overview", "selector": "[data-testid='nav-overview']", "type": "tab"},
                    {"id": "nav-movies", "selector": "[data-testid='nav-movies']", "type": "tab"},
                    {"id": "nav-games", "selector": "[data-testid='nav-games']", "type": "tab"},
                    {"id": "nav-music", "selector": "[data-testid='nav-music']", "type": "tab"},
                    {"id": "nav-photos", "selector": "[data-testid='nav-photos']", "type": "tab"},
                    {"id": "nav-vault", "selector": "[data-testid='nav-vault']", "type": "tab"},
                    {"id": "nav-share", "selector": "[data-testid='nav-share']", "type": "tab"},
                ]
            }
        },
        "modals": {
            "LOGS": {
                "tabs": [
                    {"id": "tab-this-device", "selector": "[data-testid='tab-this-device']"},
                    {"id": "tab-incidents", "selector": "[data-testid='tab-incidents']"},
                    {"id": "tab-all-nodes", "selector": "[data-testid='tab-all-nodes']"},
                ],
                "close": "[data-testid='logs-close']"
            },
            "CommunityHub": {
                "tabs": [
                    {"id": "tab-overview", "selector": "[data-testid='tab-overview']"},
                    {"id": "tab-analytics", "selector": "[data-testid='tab-analytics']"},
                    {"id": "tab-directory", "selector": "[data-testid='tab-directory']"},
                    {"id": "tab-comms", "selector": "[data-testid='tab-comms']"},
                ],
                "close": "[data-testid='community-close']"
            },
            "AdminConsole": {
                "sections": [
                    {"id": "admin-section-fleet", "selector": "[data-testid='admin-section-fleet']"},
                    {"id": "admin-section-roster", "selector": "[data-testid='admin-section-roster']"},
                    {"id": "admin-section-broadcast", "selector": "[data-testid='admin-section-broadcast']"},
                    {"id": "admin-section-audit", "selector": "[data-testid='admin-section-audit']"},
                ]
            },
            "HelpCenter": {
                "close": "[data-testid='help-center-close']"
            },
            "SystemStatus": {
                "button": "[data-testid='system-status-btn']"
            }
        }
    }
    
    graph_path = OUTPUT_DIR / "INTERACTION_GRAPH.json"
    with open(graph_path, "w") as f:
        json.dump(graph, f, indent=2)
    
    print(f"  Interaction Graph updated: {graph_path}")


if __name__ == "__main__":
    # Parse args
    import argparse
    parser = argparse.ArgumentParser(description="OMEGA Dashboard Exhaustive Crawler")
    parser.add_argument("--base-url", default=BASE_URL, help="Base URL of the app")
    args = parser.parse_args()
    BASE_URL = args.base_url
    
    # Update interaction graph first
    update_interaction_graph()
    
    # Run crawler
    asyncio.run(run_crawler())
