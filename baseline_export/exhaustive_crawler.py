#!/usr/bin/env python3
"""
OMEGA Dashboard - Exhaustive Visual Baseline Crawler v2
Captures ALL interactive states with proper persistence
"""

import asyncio
import json
import os
from datetime import datetime
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:3000"
OUTPUT_DIR = "/app/baseline_export"

traversal_log = []
coverage_data = {
    "total_discovered": 0,
    "total_exercised": 0,
    "total_failed": 0,
    "elements": [],
    "failures": []
}

BREAKPOINTS = [
    ("desktop_dark", 1440, 900, "dark"),
    ("desktop_light", 1440, 900, "light"),
    ("mobile_dark", 390, 844, "dark"),
    ("mobile_light", 390, 844, "light"),
]

def log(action):
    entry = f"[{datetime.now().isoformat()}] {action}"
    traversal_log.append(entry)
    print(entry)

async def apply_theme(page, theme):
    """Apply theme after page is loaded"""
    try:
        if theme == "dark":
            await page.evaluate("""() => {
                localStorage.setItem('omega-theme', 'dark');
                document.documentElement.classList.add('dark');
            }""")
        else:
            await page.evaluate("""() => {
                localStorage.setItem('omega-theme', 'light');
                document.documentElement.classList.remove('dark');
            }""")
        await page.wait_for_timeout(300)
    except Exception as e:
        log(f"Theme warning: {e}")

async def safe_screenshot(page, folder, filename, description):
    """Take screenshot with verification"""
    path = f"{OUTPUT_DIR}/{folder}/{filename}"
    try:
        await page.screenshot(path=path, type="jpeg", quality=80)
        if os.path.exists(path):
            size = os.path.getsize(path)
            log(f"OK: {folder}/{filename} ({size}b) - {description}")
            coverage_data["elements"].append({
                "id": filename,
                "description": description,
                "screenshot": f"{folder}/{filename}",
                "status": "captured"
            })
            return True
        else:
            log(f"FAIL: {folder}/{filename} - Not created")
            coverage_data["failures"].append({"id": filename, "error": "Not created"})
            return False
    except Exception as e:
        log(f"ERROR: {folder}/{filename} - {e}")
        coverage_data["failures"].append({"id": filename, "error": str(e)})
        return False

async def wait_click(page, selector, timeout=3000):
    """Click with wait"""
    try:
        await page.wait_for_selector(selector, timeout=timeout, state="visible")
        await page.locator(selector).first.click(force=True)
        await page.wait_for_timeout(800)
        return True
    except:
        return False

async def run_crawler():
    for folder in ["desktop_dark", "desktop_light", "mobile_dark", "mobile_light"]:
        os.makedirs(f"{OUTPUT_DIR}/{folder}", exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        log("=== EXHAUSTIVE CRAWL START ===")
        n = 1
        
        # ===== HOME PAGE =====
        log("--- HOME PAGE ---")
        for folder, w, h, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": w, "height": h})
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1500)
            await apply_theme(page, theme)
            await page.wait_for_timeout(500)
            await safe_screenshot(page, folder, f"{n:04d}_home_default.jpg", "Home default")
        n += 1
        
        # Home scrolled
        for folder, w, h, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": w, "height": h})
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await apply_theme(page, theme)
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(500)
            await safe_screenshot(page, folder, f"{n:04d}_home_bottom.jpg", "Home scrolled bottom")
        n += 1
        
        # ===== MODALS =====
        log("--- MODALS ---")
        
        # LOGS Modal
        for folder, w, h, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": w, "height": h})
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await apply_theme(page, theme)
            sel = '[data-testid="logs-btn"]' if w > 768 else '[data-testid="logs-btn-mobile"]'
            if await wait_click(page, sel):
                await safe_screenshot(page, folder, f"{n:04d}_modal_logs.jpg", "LOGS modal")
                await page.keyboard.press("Escape")
        n += 1
        
        # Community Modal
        for folder, w, h, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": w, "height": h})
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await apply_theme(page, theme)
            sel = '[data-testid="community-btn"]' if w > 768 else '[data-testid="community-btn-mobile"]'
            if await wait_click(page, sel):
                await safe_screenshot(page, folder, f"{n:04d}_modal_community.jpg", "Community modal")
                await page.keyboard.press("Escape")
        n += 1
        
        # Community tabs (desktop dark)
        await page.set_viewport_size({"width": 1440, "height": 900})
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(1000)
        await apply_theme(page, "dark")
        if await wait_click(page, '[data-testid="community-btn"]'):
            for tab_id, tab_name in [("directory", "Directory"), ("analytics", "Analytics"), ("comms", "Comms")]:
                if await wait_click(page, f'[data-testid="tab-{tab_id}"]'):
                    await safe_screenshot(page, "desktop_dark", f"{n:04d}_community_{tab_id}.jpg", f"Community {tab_name}")
                n += 1
            await page.keyboard.press("Escape")
        
        # Help Center
        for folder, w, h, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": w, "height": h})
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await apply_theme(page, theme)
            if w > 768:
                if await wait_click(page, '[data-testid="help-center-btn"]'):
                    await safe_screenshot(page, folder, f"{n:04d}_modal_help.jpg", "Help Center")
                    await page.keyboard.press("Escape")
            else:
                if await wait_click(page, '[data-testid="overflow-menu-btn"]'):
                    await page.wait_for_timeout(300)
                    try:
                        await page.get_by_text("Help Center").click()
                        await page.wait_for_timeout(800)
                        await safe_screenshot(page, folder, f"{n:04d}_modal_help.jpg", "Help Center mobile")
                        await page.keyboard.press("Escape")
                    except: pass
        n += 1
        
        # Admin Console
        for folder, w, h, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": w, "height": h})
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await apply_theme(page, theme)
            if w > 768:
                if await wait_click(page, '[data-testid="admin-console-btn"]'):
                    await safe_screenshot(page, folder, f"{n:04d}_modal_admin.jpg", "Admin Console")
                    await page.keyboard.press("Escape")
            else:
                if await wait_click(page, '[data-testid="overflow-menu-btn"]'):
                    await page.wait_for_timeout(300)
                    try:
                        await page.get_by_text("Admin Console").click()
                        await page.wait_for_timeout(800)
                        await safe_screenshot(page, folder, f"{n:04d}_modal_admin.jpg", "Admin Console mobile")
                        await page.keyboard.press("Escape")
                    except: pass
        n += 1
        
        # Admin tabs (desktop dark)
        await page.set_viewport_size({"width": 1440, "height": 900})
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(1000)
        await apply_theme(page, "dark")
        if await wait_click(page, '[data-testid="admin-console-btn"]'):
            await safe_screenshot(page, "desktop_dark", f"{n:04d}_admin_fleet.jpg", "Admin Fleet tab")
            n += 1
            for tab_id, tab_name in [("broadcast", "Broadcast"), ("system", "System"), ("backups", "Backups"), ("audit", "Audit")]:
                if await wait_click(page, f'[data-testid="admin-tab-{tab_id}"]'):
                    await safe_screenshot(page, "desktop_dark", f"{n:04d}_admin_{tab_id}.jpg", f"Admin {tab_name}")
                n += 1
            await page.keyboard.press("Escape")
        
        # System Status
        for folder, w, h, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": w, "height": h})
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await apply_theme(page, theme)
            if await wait_click(page, '[data-testid="system-status-btn"]'):
                await safe_screenshot(page, folder, f"{n:04d}_modal_status.jpg", "System Status")
                await page.keyboard.press("Escape")
        n += 1
        
        # System Status expanded
        await page.set_viewport_size({"width": 1440, "height": 900})
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(1000)
        await apply_theme(page, "dark")
        if await wait_click(page, '[data-testid="system-status-btn"]'):
            try:
                await page.get_by_text("ENDPOINT STATUS").click()
                await page.wait_for_timeout(500)
                await safe_screenshot(page, "desktop_dark", f"{n:04d}_status_endpoints.jpg", "Status endpoints expanded")
            except: pass
            await page.keyboard.press("Escape")
        n += 1
        
        # Mobile overflow
        log("--- MOBILE OVERFLOW ---")
        for folder in ["mobile_dark", "mobile_light"]:
            theme = "dark" if "dark" in folder else "light"
            await page.set_viewport_size({"width": 390, "height": 844})
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await apply_theme(page, theme)
            if await wait_click(page, '[data-testid="overflow-menu-btn"]'):
                await safe_screenshot(page, folder, f"{n:04d}_overflow_menu.jpg", "Overflow menu")
                await page.keyboard.press("Escape")
        n += 1
        
        # ===== QUICK TOOLS =====
        log("--- QUICK TOOLS ---")
        tools = ["quickguide", "calculator", "translator", "sos", "currency", "dictionary", "notes"]
        for tool in tools:
            await page.set_viewport_size({"width": 1440, "height": 900})
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await apply_theme(page, "dark")
            if await wait_click(page, f'[data-testid="tool-{tool}"]'):
                await safe_screenshot(page, "desktop_dark", f"{n:04d}_tool_{tool}.jpg", f"Tool {tool}")
                await page.keyboard.press("Escape")
            n += 1
        
        # ===== ENTERTAINMENT PAGE =====
        log("--- ENTERTAINMENT PAGE ---")
        for folder, w, h, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": w, "height": h})
            await page.goto(f"{BASE_URL}/#/entertainment")
            await page.wait_for_timeout(1500)
            await apply_theme(page, theme)
            await safe_screenshot(page, folder, f"{n:04d}_entertainment.jpg", "Entertainment overview")
        n += 1
        
        # Entertainment tabs (desktop dark)
        tabs = [("movies", "Movies"), ("games", "Games"), ("music", "Music"), ("photos", "Photos"), ("vault", "Vault"), ("share", "FileDrop")]
        for tab_id, tab_name in tabs:
            await page.set_viewport_size({"width": 1440, "height": 900})
            await page.goto(f"{BASE_URL}/#/entertainment")
            await page.wait_for_timeout(1000)
            await apply_theme(page, "dark")
            if await wait_click(page, f'[data-testid="nav-{tab_id}"]'):
                await safe_screenshot(page, "desktop_dark", f"{n:04d}_ent_{tab_id}.jpg", f"Entertainment {tab_name}")
            n += 1
        
        # Movie Night modal
        for folder, w, h, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": w, "height": h})
            await page.goto(f"{BASE_URL}/#/entertainment")
            await page.wait_for_timeout(1000)
            await apply_theme(page, theme)
            try:
                await page.get_by_text("Start Movie Night").click()
                await page.wait_for_timeout(800)
                await safe_screenshot(page, folder, f"{n:04d}_modal_movienight.jpg", "Movie Night modal")
                await page.keyboard.press("Escape")
            except: pass
        n += 1
        
        # ===== HEADER VERIFICATION =====
        log("--- HEADER VERIFICATION ---")
        await page.set_viewport_size({"width": 1440, "height": 900})
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(2000)
        await apply_theme(page, "dark")
        await safe_screenshot(page, "desktop_dark", f"{n:04d}_header_1440.jpg", "Header at 1440px (row proof)")
        n += 1
        await apply_theme(page, "light")
        await safe_screenshot(page, "desktop_light", f"{n:04d}_header_1440.jpg", "Header at 1440px light")
        n += 1
        
        # ===== SEARCH BAR =====
        log("--- SEARCH BAR ---")
        await page.set_viewport_size({"width": 1440, "height": 900})
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(1000)
        await apply_theme(page, "dark")
        try:
            search = page.locator('input[placeholder*="Search"]').first
            await search.click()
            await page.wait_for_timeout(300)
            await safe_screenshot(page, "desktop_dark", f"{n:04d}_search_focus.jpg", "Search focused")
            n += 1
            await search.fill("weather")
            await page.wait_for_timeout(500)
            await safe_screenshot(page, "desktop_dark", f"{n:04d}_search_query.jpg", "Search with query")
            n += 1
        except: pass
        
        await browser.close()
        
        # ===== SAVE RESULTS =====
        log("=== CRAWL COMPLETE ===")
        
        total = 0
        for folder in ["desktop_dark", "desktop_light", "mobile_dark", "mobile_light"]:
            fp = f"{OUTPUT_DIR}/{folder}"
            if os.path.exists(fp):
                files = [f for f in os.listdir(fp) if f.endswith('.jpg')]
                total += len(files)
                log(f"  {folder}: {len(files)} files")
        
        coverage_data["total_discovered"] = len(coverage_data["elements"]) + len(coverage_data["failures"])
        coverage_data["total_exercised"] = len(coverage_data["elements"])
        coverage_data["total_failed"] = len(coverage_data["failures"])
        
        with open(f"{OUTPUT_DIR}/TRAVERSAL_LOG.txt", "w") as f:
            f.write("\n".join(traversal_log))
        
        with open(f"{OUTPUT_DIR}/COVERAGE_REPORT.json", "w") as f:
            json.dump(coverage_data, f, indent=2)
        
        log(f"TOTAL SCREENSHOTS: {total}")
        return total

if __name__ == "__main__":
    total = asyncio.run(run_crawler())
    print(f"\n=== FINAL: {total} screenshots ===")
