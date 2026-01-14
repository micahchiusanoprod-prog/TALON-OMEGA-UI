#!/usr/bin/env python3
"""
OMEGA Dashboard - Exhaustive Visual Baseline Crawler
Captures ALL interactive states with proper persistence
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:3000"
OUTPUT_DIR = "/app/baseline_export"

# Tracking
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

async def set_theme(page, theme):
    """Set theme - must be called after page navigation"""
    try:
        if theme == "dark":
            await page.evaluate("localStorage.setItem('omega-theme', 'dark'); document.documentElement.classList.add('dark')")
        else:
            await page.evaluate("localStorage.setItem('omega-theme', 'light'); document.documentElement.classList.remove('dark')")
    except Exception as e:
        log(f"Theme set warning: {e}")
    await page.wait_for_timeout(500)

async def safe_screenshot(page, folder, filename, description):
    """Take screenshot with verification"""
    path = f"{OUTPUT_DIR}/{folder}/{filename}"
    try:
        await page.screenshot(path=path, type="jpeg", quality=80)
        if os.path.exists(path):
            size = os.path.getsize(path)
            log(f"SCREENSHOT OK: {folder}/{filename} ({size} bytes) - {description}")
            coverage_data["elements"].append({
                "id": filename,
                "description": description,
                "screenshot": f"{folder}/{filename}",
                "status": "captured"
            })
            return True
        else:
            log(f"SCREENSHOT FAIL: {folder}/{filename} - File not created")
            coverage_data["failures"].append({
                "id": filename,
                "description": description,
                "error": "File not created"
            })
            return False
    except Exception as e:
        log(f"SCREENSHOT ERROR: {folder}/{filename} - {str(e)}")
        coverage_data["failures"].append({
            "id": filename,
            "description": description,
            "error": str(e)
        })
        return False

async def wait_and_click(page, selector, timeout=5000):
    """Click with explicit wait"""
    try:
        await page.wait_for_selector(selector, timeout=timeout, state="visible")
        await page.locator(selector).first.click(force=True)
        await page.wait_for_timeout(800)
        return True
    except Exception as e:
        log(f"CLICK FAIL: {selector} - {str(e)}")
        return False

async def capture_all_breakpoints(page, route, prefix, description):
    """Capture a state at all 4 breakpoints"""
    for folder, width, height, theme in BREAKPOINTS:
        await page.set_viewport_size({"width": width, "height": height})
        await set_theme(page, theme)
        if route:
            await page.goto(f"{BASE_URL}/#{route}")
            await page.wait_for_timeout(1500)
        await safe_screenshot(page, folder, f"{prefix}_{folder}.jpg", description)

async def run_crawler():
    """Main crawler function"""
    os.makedirs(f"{OUTPUT_DIR}/desktop_dark", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/desktop_light", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/mobile_dark", exist_ok=True)
    os.makedirs(f"{OUTPUT_DIR}/mobile_light", exist_ok=True)
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        log("=== STARTING EXHAUSTIVE VISUAL CRAWL ===")
        
        # Counter for screenshot naming
        n = 1
        
        # ============================================
        # ROUTE: HOME (/)
        # ============================================
        log("--- ROUTE: / (Home Dashboard) ---")
        
        # Home - Default (all breakpoints)
        for folder, width, height, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": width, "height": height})
            await set_theme(page, theme)
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(2000)
            await safe_screenshot(page, folder, f"{n:04d}_home_default.jpg", "Home - default view")
        n += 1
        
        # Home - Scrolled middle
        for folder, width, height, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": width, "height": height})
            await set_theme(page, theme)
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
            await page.wait_for_timeout(500)
            await safe_screenshot(page, folder, f"{n:04d}_home_scroll_mid.jpg", "Home - scrolled middle")
        n += 1
        
        # Home - Scrolled bottom
        for folder, width, height, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": width, "height": height})
            await set_theme(page, theme)
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(500)
            await safe_screenshot(page, folder, f"{n:04d}_home_scroll_bottom.jpg", "Home - scrolled bottom (Entertainment)")
        n += 1
        
        # ============================================
        # HEADER MODALS
        # ============================================
        log("--- HEADER MODALS ---")
        
        # LOGS Analytics Modal
        for folder, width, height, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": width, "height": height})
            await set_theme(page, theme)
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            selector = '[data-testid="logs-btn"]' if width > 768 else '[data-testid="logs-btn-mobile"]'
            if await wait_and_click(page, selector):
                await safe_screenshot(page, folder, f"{n:04d}_modal_logs.jpg", "LOGS Analytics modal")
                await page.keyboard.press("Escape")
        n += 1
        
        # Community Hub Modal
        for folder, width, height, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": width, "height": height})
            await set_theme(page, theme)
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            selector = '[data-testid="community-btn"]' if width > 768 else '[data-testid="community-btn-mobile"]'
            if await wait_and_click(page, selector):
                await safe_screenshot(page, folder, f"{n:04d}_modal_community.jpg", "Community Hub modal")
                await page.keyboard.press("Escape")
        n += 1
        
        # Community Hub - Tabs (desktop dark only for tabs, shows representative)
        await page.set_viewport_size({"width": 1440, "height": 900})
        await set_theme(page, "dark")
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(1000)
        
        if await wait_and_click(page, '[data-testid="community-btn"]'):
            # Directory tab
            if await wait_and_click(page, '[data-testid="tab-directory"]'):
                await safe_screenshot(page, "desktop_dark", f"{n:04d}_community_directory.jpg", "Community - Directory tab")
            n += 1
            
            # Analytics tab
            if await wait_and_click(page, '[data-testid="tab-analytics"]'):
                await safe_screenshot(page, "desktop_dark", f"{n:04d}_community_analytics.jpg", "Community - Analytics tab")
            n += 1
            
            # Comms tab
            if await wait_and_click(page, '[data-testid="tab-comms"]'):
                await safe_screenshot(page, "desktop_dark", f"{n:04d}_community_comms.jpg", "Community - Comms tab")
            n += 1
            
            await page.keyboard.press("Escape")
        
        # Help Center Modal
        for folder, width, height, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": width, "height": height})
            await set_theme(page, theme)
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            if width > 768:
                if await wait_and_click(page, '[data-testid="help-center-btn"]'):
                    await safe_screenshot(page, folder, f"{n:04d}_modal_helpcenter.jpg", "Help Center modal")
                    await page.keyboard.press("Escape")
            else:
                # Mobile - use overflow menu
                if await wait_and_click(page, '[data-testid="overflow-menu-btn"]'):
                    await page.wait_for_timeout(300)
                    try:
                        await page.get_by_text("Help Center").click()
                        await page.wait_for_timeout(800)
                        await safe_screenshot(page, folder, f"{n:04d}_modal_helpcenter.jpg", "Help Center modal (mobile)")
                        await page.keyboard.press("Escape")
                    except:
                        pass
        n += 1
        
        # Admin Console Modal
        for folder, width, height, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": width, "height": height})
            await set_theme(page, theme)
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            if width > 768:
                if await wait_and_click(page, '[data-testid="admin-console-btn"]'):
                    await safe_screenshot(page, folder, f"{n:04d}_modal_admin.jpg", "Admin Console modal")
                    await page.keyboard.press("Escape")
            else:
                if await wait_and_click(page, '[data-testid="overflow-menu-btn"]'):
                    await page.wait_for_timeout(300)
                    try:
                        await page.get_by_text("Admin Console").click()
                        await page.wait_for_timeout(800)
                        await safe_screenshot(page, folder, f"{n:04d}_modal_admin.jpg", "Admin Console modal (mobile)")
                        await page.keyboard.press("Escape")
                    except:
                        pass
        n += 1
        
        # Admin Console - Tabs (desktop dark)
        await page.set_viewport_size({"width": 1440, "height": 900})
        await set_theme(page, "dark")
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(1000)
        
        if await wait_and_click(page, '[data-testid="admin-console-btn"]'):
            # Fleet tab (default)
            await safe_screenshot(page, "desktop_dark", f"{n:04d}_admin_fleet.jpg", "Admin Console - Fleet tab")
            n += 1
            
            # Broadcast tab
            if await wait_and_click(page, '[data-testid="admin-tab-broadcast"]'):
                await safe_screenshot(page, "desktop_dark", f"{n:04d}_admin_broadcast.jpg", "Admin Console - Broadcast tab")
            n += 1
            
            # System tab
            if await wait_and_click(page, '[data-testid="admin-tab-system"]'):
                await safe_screenshot(page, "desktop_dark", f"{n:04d}_admin_system.jpg", "Admin Console - System tab")
            n += 1
            
            # Backups tab
            if await wait_and_click(page, '[data-testid="admin-tab-backups"]'):
                await safe_screenshot(page, "desktop_dark", f"{n:04d}_admin_backups.jpg", "Admin Console - Backups tab")
            n += 1
            
            # Audit tab
            if await wait_and_click(page, '[data-testid="admin-tab-audit"]'):
                await safe_screenshot(page, "desktop_dark", f"{n:04d}_admin_audit.jpg", "Admin Console - Audit tab")
            n += 1
            
            await page.keyboard.press("Escape")
        
        # System Status Panel
        for folder, width, height, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": width, "height": height})
            await set_theme(page, theme)
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            if await wait_and_click(page, '[data-testid="system-status-btn"]'):
                await safe_screenshot(page, folder, f"{n:04d}_modal_systemstatus.jpg", "System Status Panel")
                await page.keyboard.press("Escape")
        n += 1
        
        # System Status - Endpoints expanded (desktop dark)
        await page.set_viewport_size({"width": 1440, "height": 900})
        await set_theme(page, "dark")
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(1000)
        
        if await wait_and_click(page, '[data-testid="system-status-btn"]'):
            try:
                await page.get_by_text("ENDPOINT STATUS").click()
                await page.wait_for_timeout(500)
                await safe_screenshot(page, "desktop_dark", f"{n:04d}_systemstatus_endpoints.jpg", "System Status - Endpoints expanded")
            except:
                pass
            await page.keyboard.press("Escape")
        n += 1
        
        # ============================================
        # MOBILE OVERFLOW MENU
        # ============================================
        log("--- MOBILE OVERFLOW MENU ---")
        
        for folder, width, height, theme in [("mobile_dark", 390, 844, "dark"), ("mobile_light", 390, 844, "light")]:
            await page.set_viewport_size({"width": width, "height": height})
            await set_theme(page, theme)
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            if await wait_and_click(page, '[data-testid="overflow-menu-btn"]'):
                await safe_screenshot(page, folder, f"{n:04d}_overflow_menu.jpg", "Mobile overflow menu open")
                await page.keyboard.press("Escape")
        n += 1
        
        # ============================================
        # QUICK TOOLS
        # ============================================
        log("--- QUICK TOOLS ---")
        
        quick_tools = [
            ("tool-quickguide", "Quick Guide"),
            ("tool-calculator", "Calculator"),
            ("tool-translator", "Translator"),
            ("tool-sos", "SOS Beacon"),
            ("tool-currency", "Currency Converter"),
            ("tool-dictionary", "Dictionary"),
            ("tool-notes", "Field Notes"),
        ]
        
        for tool_id, tool_name in quick_tools:
            await page.set_viewport_size({"width": 1440, "height": 900})
            await set_theme(page, "dark")
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            if await wait_and_click(page, f'[data-testid="{tool_id}"]'):
                await safe_screenshot(page, "desktop_dark", f"{n:04d}_quicktool_{tool_id}.jpg", f"Quick Tool: {tool_name}")
                await page.keyboard.press("Escape")
            n += 1
        
        # ============================================
        # LANGUAGE SELECTOR
        # ============================================
        log("--- LANGUAGE SELECTOR ---")
        
        await page.set_viewport_size({"width": 1440, "height": 900})
        await set_theme(page, "dark")
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(1000)
        
        if await wait_and_click(page, '[data-testid="language-selector"]'):
            await safe_screenshot(page, "desktop_dark", f"{n:04d}_language_dropdown.jpg", "Language selector dropdown")
            await page.keyboard.press("Escape")
        n += 1
        
        # ============================================
        # ENTERTAINMENT PAGE
        # ============================================
        log("--- ROUTE: /entertainment ---")
        
        # Entertainment - Overview (all breakpoints)
        for folder, width, height, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": width, "height": height})
            await set_theme(page, theme)
            await page.goto(f"{BASE_URL}/#/entertainment")
            await page.wait_for_timeout(2000)
            await safe_screenshot(page, folder, f"{n:04d}_entertainment_overview.jpg", "Entertainment - Overview")
        n += 1
        
        # Entertainment - All tabs (desktop dark)
        entertainment_tabs = [
            ("nav-movies", "Movies & TV"),
            ("nav-games", "Games Hub"),
            ("nav-music", "Music"),
            ("nav-photos", "Photos"),
            ("nav-vault", "Vault"),
            ("nav-share", "File Drop"),
        ]
        
        for tab_id, tab_name in entertainment_tabs:
            await page.set_viewport_size({"width": 1440, "height": 900})
            await set_theme(page, "dark")
            await page.goto(f"{BASE_URL}/#/entertainment")
            await page.wait_for_timeout(1000)
            
            if await wait_and_click(page, f'[data-testid="{tab_id}"]'):
                await safe_screenshot(page, "desktop_dark", f"{n:04d}_entertainment_{tab_id}.jpg", f"Entertainment - {tab_name}")
            n += 1
        
        # Movie Night Modal
        for folder, width, height, theme in BREAKPOINTS:
            await page.set_viewport_size({"width": width, "height": height})
            await set_theme(page, theme)
            await page.goto(f"{BASE_URL}/#/entertainment")
            await page.wait_for_timeout(1000)
            
            try:
                await page.get_by_text("Start Movie Night").click()
                await page.wait_for_timeout(800)
                await safe_screenshot(page, folder, f"{n:04d}_modal_movienight.jpg", "Movie Night Modal")
                await page.keyboard.press("Escape")
            except:
                pass
        n += 1
        
        # ============================================
        # SEARCH BAR STATES
        # ============================================
        log("--- SEARCH BAR ---")
        
        await page.set_viewport_size({"width": 1440, "height": 900})
        await set_theme(page, "dark")
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(1000)
        
        try:
            search = page.locator('input[placeholder*="Search"]').first
            await search.click()
            await page.wait_for_timeout(300)
            await safe_screenshot(page, "desktop_dark", f"{n:04d}_search_focused.jpg", "Search bar - focused")
            n += 1
            
            await search.fill("weather")
            await page.wait_for_timeout(500)
            await safe_screenshot(page, "desktop_dark", f"{n:04d}_search_query.jpg", "Search bar - with query")
            n += 1
        except:
            pass
        
        # ============================================
        # HEADER ROW VERIFICATION (1440px)
        # ============================================
        log("--- HEADER ROW VERIFICATION ---")
        
        await page.set_viewport_size({"width": 1440, "height": 900})
        await set_theme(page, "dark")
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(2000)
        
        # Take a focused header screenshot
        await page.evaluate("window.scrollTo(0, 0)")
        await safe_screenshot(page, "desktop_dark", f"{n:04d}_header_verification.jpg", "Header at 1440px - LOGS/Community/HelpCenter/Entertainment row")
        n += 1
        
        # Also light theme
        await set_theme(page, "light")
        await page.wait_for_timeout(1000)
        await safe_screenshot(page, "desktop_light", f"{n:04d}_header_verification.jpg", "Header at 1440px light theme")
        n += 1
        
        await browser.close()
        
        # ============================================
        # SAVE LOGS AND COVERAGE
        # ============================================
        log("=== CRAWL COMPLETE ===")
        
        # Count results
        total_files = 0
        for folder in ["desktop_dark", "desktop_light", "mobile_dark", "mobile_light"]:
            folder_path = f"{OUTPUT_DIR}/{folder}"
            if os.path.exists(folder_path):
                files = [f for f in os.listdir(folder_path) if f.endswith('.jpg')]
                total_files += len(files)
                log(f"  {folder}: {len(files)} screenshots")
        
        coverage_data["total_discovered"] = len(coverage_data["elements"]) + len(coverage_data["failures"])
        coverage_data["total_exercised"] = len(coverage_data["elements"])
        coverage_data["total_failed"] = len(coverage_data["failures"])
        
        # Save traversal log
        with open(f"{OUTPUT_DIR}/TRAVERSAL_LOG.txt", "w") as f:
            f.write("\n".join(traversal_log))
        
        # Save coverage
        with open(f"{OUTPUT_DIR}/COVERAGE_REPORT.json", "w") as f:
            json.dump(coverage_data, f, indent=2)
        
        log(f"Total screenshots persisted: {total_files}")
        return total_files

if __name__ == "__main__":
    total = asyncio.run(run_crawler())
    print(f"\n=== FINAL COUNT: {total} screenshots persisted ===")
