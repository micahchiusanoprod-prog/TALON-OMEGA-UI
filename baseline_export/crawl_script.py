"""
OMEGA Dashboard - Exhaustive Visual Crawl Script
Captures all UI states across 4 breakpoints: desktop_light, desktop_dark, mobile_light, mobile_dark
"""

import asyncio
import json
import os
from datetime import datetime
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:3000"
OUTPUT_DIR = "/app/baseline_export"
NETWORK_LOG = []
TRAVERSAL_LOG = []
DOM_INVENTORY = {}

# Breakpoints
BREAKPOINTS = {
    "desktop_light": {"width": 1440, "height": 900, "theme": "light"},
    "desktop_dark": {"width": 1440, "height": 900, "theme": "dark"},
    "mobile_light": {"width": 390, "height": 844, "theme": "light"},
    "mobile_dark": {"width": 390, "height": 844, "theme": "dark"},
}

def log_action(action):
    """Log traversal action with timestamp"""
    entry = f"[{datetime.now().isoformat()}] {action}"
    TRAVERSAL_LOG.append(entry)
    print(entry)

async def set_theme(page, theme):
    """Set theme via localStorage and reload"""
    await page.evaluate(f"""() => {{
        localStorage.setItem('omega-theme', '{theme}');
        document.documentElement.classList.toggle('dark', '{theme}' === 'dark');
    }}""")
    await page.reload()
    await page.wait_for_timeout(1000)

async def capture_screenshot(page, folder, filename, description):
    """Capture screenshot and log"""
    path = f"{OUTPUT_DIR}/{folder}/{filename}"
    await page.screenshot(path=path, quality=80, type="jpeg")
    log_action(f"SCREENSHOT: {folder}/{filename} - {description}")
    return path

async def scan_dom_controls(page, route):
    """Scan DOM for all interactive controls"""
    controls = await page.evaluate("""() => {
        const selectors = 'button, a[href], [role="button"], [role="tab"], [role="menuitem"], input, select, textarea, [data-testid]';
        const elements = document.querySelectorAll(selectors);
        return Array.from(elements).map(el => ({
            tagName: el.tagName.toLowerCase(),
            type: el.type || el.getAttribute('role') || 'unknown',
            text: (el.textContent || '').trim().slice(0, 100),
            id: el.id || null,
            classes: el.className || null,
            dataTestId: el.getAttribute('data-testid') || null,
            href: el.href || null,
            visible: el.offsetParent !== null,
            enabled: !el.disabled
        }));
    }""")
    DOM_INVENTORY[route] = controls
    log_action(f"DOM SCAN: {route} - Found {len(controls)} controls")
    return controls

async def capture_route_all_breakpoints(page, route_path, screenshot_prefix, description):
    """Capture a route at all 4 breakpoints"""
    screenshots = []
    for bp_name, bp_config in BREAKPOINTS.items():
        await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
        await set_theme(page, bp_config["theme"])
        await page.goto(f"{BASE_URL}/#{route_path}")
        await page.wait_for_timeout(1500)
        
        filename = f"{screenshot_prefix}_{route_path.replace('/', '_') or 'home'}_{bp_name}.jpg"
        await capture_screenshot(page, bp_name, filename, f"{description} ({bp_name})")
        screenshots.append(filename)
    return screenshots

async def capture_modal_all_breakpoints(page, modal_name, trigger_selector, screenshot_prefix, close_after=True):
    """Capture a modal at all 4 breakpoints"""
    screenshots = []
    for bp_name, bp_config in BREAKPOINTS.items():
        await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
        await set_theme(page, bp_config["theme"])
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(1000)
        
        # Open modal
        try:
            trigger = page.locator(trigger_selector).first
            await trigger.click(force=True)
            await page.wait_for_timeout(800)
            log_action(f"OPEN MODAL: {modal_name} via {trigger_selector}")
            
            filename = f"{screenshot_prefix}_{modal_name}_{bp_name}.jpg"
            await capture_screenshot(page, bp_name, filename, f"Modal: {modal_name} ({bp_name})")
            screenshots.append(filename)
            
            # Close modal
            if close_after:
                close_btn = page.locator('button:has-text("×"), button:has(svg.lucide-x), [data-testid*="close"]').first
                try:
                    await close_btn.click(force=True, timeout=2000)
                except:
                    await page.keyboard.press("Escape")
                await page.wait_for_timeout(500)
        except Exception as e:
            log_action(f"ERROR: Failed to capture modal {modal_name}: {str(e)}")
    return screenshots

async def run_exhaustive_crawl():
    """Main crawl function"""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        
        # Enable network logging
        page = await context.new_page()
        
        async def handle_request(request):
            NETWORK_LOG.append({
                "timestamp": datetime.now().isoformat(),
                "method": request.method,
                "url": request.url,
                "resourceType": request.resource_type
            })
        
        async def handle_response(response):
            for entry in NETWORK_LOG:
                if entry["url"] == response.url and "status" not in entry:
                    entry["status"] = response.status
                    break
        
        page.on("request", handle_request)
        page.on("response", handle_response)
        
        log_action("=== STARTING EXHAUSTIVE VISUAL CRAWL ===")
        
        counter = 1
        
        # ========== ROUTE: HOME (/) ==========
        log_action("--- ROUTE: / (Home/Dashboard) ---")
        
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(2000)
            
            # Home - default view
            await capture_screenshot(page, bp_name, f"{counter:04d}_home_default.jpg", "Home - default view")
            
            # Scan DOM on first pass
            if bp_name == "desktop_dark":
                await scan_dom_controls(page, "/")
        
        counter += 1
        
        # Home - scrolled to bottom (Entertainment section)
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await page.wait_for_timeout(500)
            await capture_screenshot(page, bp_name, f"{counter:04d}_home_scrolled_bottom.jpg", "Home - scrolled to Entertainment")
        
        counter += 1
        
        # ========== HEADER MODALS ==========
        log_action("--- HEADER MODALS ---")
        
        # LOGS Modal
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            # Desktop uses logs-btn, mobile uses logs-btn-mobile
            selector = '[data-testid="logs-btn"]' if bp_config["width"] > 768 else '[data-testid="logs-btn-mobile"]'
            try:
                await page.locator(selector).click(force=True)
                await page.wait_for_timeout(800)
                await capture_screenshot(page, bp_name, f"{counter:04d}_modal_logs.jpg", "LOGS Analytics modal")
                await page.keyboard.press("Escape")
            except:
                log_action(f"SKIP: LOGS modal not available at {bp_name}")
        
        counter += 1
        
        # Community Modal
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            selector = '[data-testid="community-btn"]' if bp_config["width"] > 768 else '[data-testid="community-btn-mobile"]'
            try:
                await page.locator(selector).click(force=True)
                await page.wait_for_timeout(800)
                await capture_screenshot(page, bp_name, f"{counter:04d}_modal_community.jpg", "Community Hub modal")
                await page.keyboard.press("Escape")
            except:
                log_action(f"SKIP: Community modal not available at {bp_name}")
        
        counter += 1
        
        # Community Modal - Teams tab
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            selector = '[data-testid="community-btn"]' if bp_config["width"] > 768 else '[data-testid="community-btn-mobile"]'
            try:
                await page.locator(selector).click(force=True)
                await page.wait_for_timeout(800)
                await page.get_by_text("Teams", exact=True).click()
                await page.wait_for_timeout(500)
                await capture_screenshot(page, bp_name, f"{counter:04d}_modal_community_teams.jpg", "Community Hub - Teams tab")
                await page.keyboard.press("Escape")
            except:
                pass
        
        counter += 1
        
        # Community Modal - Bulletins tab
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            selector = '[data-testid="community-btn"]' if bp_config["width"] > 768 else '[data-testid="community-btn-mobile"]'
            try:
                await page.locator(selector).click(force=True)
                await page.wait_for_timeout(800)
                await page.get_by_text("Bulletins", exact=True).click()
                await page.wait_for_timeout(500)
                await capture_screenshot(page, bp_name, f"{counter:04d}_modal_community_bulletins.jpg", "Community Hub - Bulletins tab")
                await page.keyboard.press("Escape")
            except:
                pass
        
        counter += 1
        
        # Community Modal - Team Builder tab
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            selector = '[data-testid="community-btn"]' if bp_config["width"] > 768 else '[data-testid="community-btn-mobile"]'
            try:
                await page.locator(selector).click(force=True)
                await page.wait_for_timeout(800)
                await page.get_by_text("Team Builder", exact=True).click()
                await page.wait_for_timeout(500)
                await capture_screenshot(page, bp_name, f"{counter:04d}_modal_community_teambuilder.jpg", "Community Hub - Team Builder tab")
                await page.keyboard.press("Escape")
            except:
                pass
        
        counter += 1
        
        # Help Center Modal
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            selector = '[data-testid="help-center-btn"]' if bp_config["width"] > 768 else '[data-testid="overflow-menu-btn"]'
            try:
                await page.locator(selector).click(force=True)
                await page.wait_for_timeout(500)
                if bp_config["width"] <= 768:
                    # Mobile - click Help Center in overflow menu
                    await page.get_by_text("Help Center").click()
                    await page.wait_for_timeout(500)
                await capture_screenshot(page, bp_name, f"{counter:04d}_modal_helpcenter.jpg", "Help Center modal")
                await page.keyboard.press("Escape")
            except:
                pass
        
        counter += 1
        
        # Admin Console Modal
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            try:
                if bp_config["width"] > 768:
                    await page.locator('[data-testid="admin-console-btn"]').click(force=True)
                else:
                    await page.locator('[data-testid="overflow-menu-btn"]').click(force=True)
                    await page.wait_for_timeout(300)
                    await page.get_by_text("Admin Console").click()
                await page.wait_for_timeout(800)
                await capture_screenshot(page, bp_name, f"{counter:04d}_modal_admin.jpg", "Admin Console modal")
                await page.keyboard.press("Escape")
            except:
                pass
        
        counter += 1
        
        # Admin Console - Broadcast tab
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            try:
                if bp_config["width"] > 768:
                    await page.locator('[data-testid="admin-console-btn"]').click(force=True)
                else:
                    await page.locator('[data-testid="overflow-menu-btn"]').click(force=True)
                    await page.wait_for_timeout(300)
                    await page.get_by_text("Admin Console").click()
                await page.wait_for_timeout(800)
                await page.get_by_text("Broadcast", exact=True).click()
                await page.wait_for_timeout(500)
                await capture_screenshot(page, bp_name, f"{counter:04d}_modal_admin_broadcast.jpg", "Admin Console - Broadcast tab")
                await page.keyboard.press("Escape")
            except:
                pass
        
        counter += 1
        
        # Admin Console - Audit tab
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            try:
                if bp_config["width"] > 768:
                    await page.locator('[data-testid="admin-console-btn"]').click(force=True)
                else:
                    await page.locator('[data-testid="overflow-menu-btn"]').click(force=True)
                    await page.wait_for_timeout(300)
                    await page.get_by_text("Admin Console").click()
                await page.wait_for_timeout(800)
                await page.get_by_text("Audit", exact=True).click()
                await page.wait_for_timeout(500)
                await capture_screenshot(page, bp_name, f"{counter:04d}_modal_admin_audit.jpg", "Admin Console - Audit tab")
                await page.keyboard.press("Escape")
            except:
                pass
        
        counter += 1
        
        # System Status Panel
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            try:
                await page.locator('[data-testid="system-status-btn"]').click(force=True)
                await page.wait_for_timeout(800)
                await capture_screenshot(page, bp_name, f"{counter:04d}_modal_systemstatus.jpg", "System Status Panel")
                await page.keyboard.press("Escape")
            except:
                pass
        
        counter += 1
        
        # System Status - Endpoints expanded
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            try:
                await page.locator('[data-testid="system-status-btn"]').click(force=True)
                await page.wait_for_timeout(800)
                await page.get_by_text("ENDPOINT STATUS").click()
                await page.wait_for_timeout(500)
                await capture_screenshot(page, bp_name, f"{counter:04d}_modal_systemstatus_endpoints.jpg", "System Status - Endpoints expanded")
                await page.keyboard.press("Escape")
            except:
                pass
        
        counter += 1
        
        # ========== QUICK TOOLS MODALS ==========
        log_action("--- QUICK TOOLS MODALS ---")
        
        quick_tools = [
            ("Quick Guide", "tool-quickguide"),
            ("Calculator", "tool-calculator"),
            ("Translator", "tool-translator"),
            ("SOS Beacon", "tool-sos"),
            ("Currency", "tool-currency"),
            ("Dictionary", "tool-dictionary"),
            ("Field Notes", "tool-notes"),
        ]
        
        for tool_name, tool_id in quick_tools:
            for bp_name, bp_config in BREAKPOINTS.items():
                await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
                await set_theme(page, bp_config["theme"])
                await page.goto(f"{BASE_URL}/#/")
                await page.wait_for_timeout(1000)
                
                try:
                    await page.locator(f'[data-testid="{tool_id}"]').click(force=True)
                    await page.wait_for_timeout(800)
                    await capture_screenshot(page, bp_name, f"{counter:04d}_quicktool_{tool_id}.jpg", f"Quick Tool: {tool_name}")
                    await page.keyboard.press("Escape")
                except:
                    pass
            counter += 1
        
        # ========== MOBILE OVERFLOW MENU ==========
        log_action("--- MOBILE OVERFLOW MENU ---")
        
        for bp_name, bp_config in BREAKPOINTS.items():
            if bp_config["width"] <= 768:
                await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
                await set_theme(page, bp_config["theme"])
                await page.goto(f"{BASE_URL}/#/")
                await page.wait_for_timeout(1000)
                
                try:
                    await page.locator('[data-testid="overflow-menu-btn"]').click(force=True)
                    await page.wait_for_timeout(500)
                    await capture_screenshot(page, bp_name, f"{counter:04d}_mobile_overflow_menu.jpg", "Mobile overflow menu open")
                except:
                    pass
        
        counter += 1
        
        # ========== LANGUAGE SELECTOR ==========
        log_action("--- LANGUAGE SELECTOR ---")
        
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            try:
                # Try to find language selector
                lang_btn = page.locator('[data-testid="language-selector"], button:has-text("EN"), button:has-text("ES")').first
                await lang_btn.click(force=True)
                await page.wait_for_timeout(500)
                await capture_screenshot(page, bp_name, f"{counter:04d}_language_dropdown.jpg", "Language selector dropdown")
                await page.keyboard.press("Escape")
            except:
                pass
        
        counter += 1
        
        # ========== ENTERTAINMENT PAGE ==========
        log_action("--- ROUTE: /entertainment ---")
        
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/entertainment")
            await page.wait_for_timeout(2000)
            await capture_screenshot(page, bp_name, f"{counter:04d}_entertainment_overview.jpg", "Entertainment - Overview")
            
            if bp_name == "desktop_dark":
                await scan_dom_controls(page, "/entertainment")
        
        counter += 1
        
        # Entertainment tabs
        entertainment_tabs = [
            ("movies", "Movies & TV"),
            ("games", "Games"),
            ("music", "Music"),
            ("photos", "Photos"),
            ("vault", "Vault"),
            ("share", "File Drop"),
        ]
        
        for tab_id, tab_name in entertainment_tabs:
            for bp_name, bp_config in BREAKPOINTS.items():
                await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
                await set_theme(page, bp_config["theme"])
                await page.goto(f"{BASE_URL}/#/entertainment")
                await page.wait_for_timeout(1000)
                
                try:
                    await page.locator(f'[data-testid="nav-{tab_id}"]').click()
                    await page.wait_for_timeout(800)
                    await capture_screenshot(page, bp_name, f"{counter:04d}_entertainment_{tab_id}.jpg", f"Entertainment - {tab_name}")
                except:
                    pass
            counter += 1
        
        # Movie Night Modal
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/entertainment")
            await page.wait_for_timeout(1000)
            
            try:
                await page.get_by_text("Start Movie Night").click()
                await page.wait_for_timeout(800)
                await capture_screenshot(page, bp_name, f"{counter:04d}_modal_movienight.jpg", "Movie Night Modal")
                await page.keyboard.press("Escape")
            except:
                pass
        
        counter += 1
        
        # ========== THEME TOGGLE ==========
        log_action("--- THEME TOGGLE ---")
        
        # Capture theme toggle states
        for bp_name in ["desktop_light", "desktop_dark"]:
            bp_config = BREAKPOINTS[bp_name]
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await capture_screenshot(page, bp_name, f"{counter:04d}_theme_{bp_config['theme']}.jpg", f"Theme: {bp_config['theme']}")
        
        counter += 1
        
        # ========== SEARCH BAR ==========
        log_action("--- SEARCH BAR ---")
        
        for bp_name, bp_config in BREAKPOINTS.items():
            await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
            await set_theme(page, bp_config["theme"])
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            
            try:
                search_input = page.locator('input[placeholder*="Search"]').first
                await search_input.click()
                await search_input.fill("weather")
                await page.wait_for_timeout(500)
                await capture_screenshot(page, bp_name, f"{counter:04d}_search_query.jpg", "Search bar with query")
            except:
                pass
        
        counter += 1
        
        # ========== ENTERTAINMENT TILE TABS (Home page) ==========
        log_action("--- ENTERTAINMENT TILE TABS ---")
        
        ent_tabs = ["Movies", "Shows", "Games", "Music"]
        for tab in ent_tabs:
            for bp_name, bp_config in BREAKPOINTS.items():
                await page.set_viewport_size({"width": bp_config["width"], "height": bp_config["height"]})
                await set_theme(page, bp_config["theme"])
                await page.goto(f"{BASE_URL}/#/")
                await page.wait_for_timeout(1000)
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                await page.wait_for_timeout(500)
                
                try:
                    await page.locator(f'[data-testid="entertainment-tile"] button:has-text("{tab}")').click()
                    await page.wait_for_timeout(500)
                    await capture_screenshot(page, bp_name, f"{counter:04d}_entertainment_tile_{tab.lower()}.jpg", f"Entertainment Tile - {tab} tab")
                except:
                    pass
            counter += 1
        
        await browser.close()
        
        # ========== SAVE LOGS ==========
        log_action("=== CRAWL COMPLETE ===")
        
        # Save traversal log
        with open(f"{OUTPUT_DIR}/TRAVERSAL_LOG.txt", "w") as f:
            f.write("\n".join(TRAVERSAL_LOG))
        
        # Save network log
        with open(f"{OUTPUT_DIR}/NETWORK_LOG.json", "w") as f:
            json.dump(NETWORK_LOG, f, indent=2)
        
        # Save DOM inventory
        with open(f"{OUTPUT_DIR}/DOM_INVENTORY.json", "w") as f:
            json.dump(DOM_INVENTORY, f, indent=2)
        
        print(f"\nTotal screenshots captured: ~{(counter-1)*4}")
        print(f"Traversal log entries: {len(TRAVERSAL_LOG)}")
        print(f"Network requests logged: {len(NETWORK_LOG)}")

if __name__ == "__main__":
    asyncio.run(run_exhaustive_crawl())
