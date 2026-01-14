#!/usr/bin/env python3
"""Quick capture of remaining screenshots"""
import asyncio
import json
import os
from datetime import datetime
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:3000"
OUTPUT_DIR = "/app/baseline_export"
log_entries = []

def log(msg):
    e = f"[{datetime.now().isoformat()}] {msg}"
    log_entries.append(e)
    print(e)

async def apply_theme(page, theme):
    try:
        if theme == "dark":
            await page.evaluate("localStorage.setItem('omega-theme','dark');document.documentElement.classList.add('dark')")
        else:
            await page.evaluate("localStorage.setItem('omega-theme','light');document.documentElement.classList.remove('dark')")
    except: pass

async def shot(page, folder, fn, desc):
    path = f"{OUTPUT_DIR}/{folder}/{fn}"
    try:
        await page.screenshot(path=path, type="jpeg", quality=80)
        if os.path.exists(path):
            log(f"OK: {folder}/{fn} - {desc}")
            return True
    except Exception as e:
        log(f"FAIL: {folder}/{fn} - {e}")
    return False

async def click(page, sel, timeout=2000):
    try:
        await page.wait_for_selector(sel, timeout=timeout, state="visible")
        await page.locator(sel).first.click(force=True)
        await page.wait_for_timeout(600)
        return True
    except: return False

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        log("=== CONTINUATION CRAWL ===")
        
        # Entertainment page & tabs
        n = 30
        log("--- ENTERTAINMENT ---")
        for folder, w, h, theme in [("desktop_dark", 1440, 900, "dark"), ("desktop_light", 1440, 900, "light"), ("mobile_dark", 390, 844, "dark"), ("mobile_light", 390, 844, "light")]:
            await page.set_viewport_size({"width": w, "height": h})
            await page.goto(f"{BASE_URL}/#/entertainment")
            await page.wait_for_timeout(1500)
            await apply_theme(page, theme)
            await shot(page, folder, f"{n:04d}_entertainment.jpg", "Entertainment")
        n += 1
        
        # Entertainment tabs (desktop_dark only)
        for tab_id, tab_name in [("movies", "Movies"), ("games", "Games"), ("music", "Music"), ("photos", "Photos"), ("vault", "Vault"), ("share", "FileDrop")]:
            await page.set_viewport_size({"width": 1440, "height": 900})
            await page.goto(f"{BASE_URL}/#/entertainment")
            await page.wait_for_timeout(1000)
            await apply_theme(page, "dark")
            if await click(page, f'[data-testid="nav-{tab_id}"]'):
                await shot(page, "desktop_dark", f"{n:04d}_ent_{tab_id}.jpg", f"Entertainment {tab_name}")
            n += 1
        
        # Movie Night modal
        for folder, w, h, theme in [("desktop_dark", 1440, 900, "dark"), ("mobile_dark", 390, 844, "dark")]:
            await page.set_viewport_size({"width": w, "height": h})
            await page.goto(f"{BASE_URL}/#/entertainment")
            await page.wait_for_timeout(1000)
            await apply_theme(page, theme)
            try:
                await page.get_by_text("Start Movie Night").click()
                await page.wait_for_timeout(600)
                await shot(page, folder, f"{n:04d}_modal_movienight.jpg", "Movie Night modal")
                await page.keyboard.press("Escape")
            except: pass
        n += 1
        
        # Quick tools (desktop_dark)
        log("--- QUICK TOOLS ---")
        for tool in ["quickguide", "calculator", "translator", "sos", "currency", "dictionary", "notes"]:
            await page.set_viewport_size({"width": 1440, "height": 900})
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await apply_theme(page, "dark")
            if await click(page, f'[data-testid="tool-{tool}"]'):
                await shot(page, "desktop_dark", f"{n:04d}_tool_{tool}.jpg", f"Tool {tool}")
                await page.keyboard.press("Escape")
            n += 1
        
        # Overflow menu
        log("--- OVERFLOW MENU ---")
        for folder, theme in [("mobile_dark", "dark"), ("mobile_light", "light")]:
            await page.set_viewport_size({"width": 390, "height": 844})
            await page.goto(f"{BASE_URL}/#/")
            await page.wait_for_timeout(1000)
            await apply_theme(page, theme)
            if await click(page, '[data-testid="overflow-menu-btn"]'):
                await shot(page, folder, f"{n:04d}_overflow.jpg", "Overflow menu")
                await page.keyboard.press("Escape")
        n += 1
        
        # Header verification
        log("--- HEADER VERIFY ---")
        await page.set_viewport_size({"width": 1440, "height": 900})
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(1500)
        await apply_theme(page, "dark")
        await shot(page, "desktop_dark", f"{n:04d}_header_1440.jpg", "Header at 1440px")
        n += 1
        
        # System Status endpoints
        log("--- STATUS ENDPOINTS ---")
        await page.set_viewport_size({"width": 1440, "height": 900})
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(1000)
        await apply_theme(page, "dark")
        if await click(page, '[data-testid="system-status-btn"]'):
            try:
                await page.get_by_text("ENDPOINT STATUS").click()
                await page.wait_for_timeout(500)
                await shot(page, "desktop_dark", f"{n:04d}_status_endpoints.jpg", "Status endpoints")
            except: pass
            await page.keyboard.press("Escape")
        n += 1
        
        # Admin tabs
        log("--- ADMIN TABS ---")
        await page.set_viewport_size({"width": 1440, "height": 900})
        await page.goto(f"{BASE_URL}/#/")
        await page.wait_for_timeout(1000)
        await apply_theme(page, "dark")
        if await click(page, '[data-testid="admin-console-btn"]'):
            for tab_id in ["broadcast", "system", "backups", "audit"]:
                if await click(page, f'[data-testid="admin-tab-{tab_id}"]'):
                    await shot(page, "desktop_dark", f"{n:04d}_admin_{tab_id}.jpg", f"Admin {tab_id}")
                n += 1
            await page.keyboard.press("Escape")
        
        await browser.close()
        
        # Save log
        with open(f"{OUTPUT_DIR}/TRAVERSAL_LOG_CONT.txt", "w") as f:
            f.write("\n".join(log_entries))
        
        total = sum(len([f for f in os.listdir(f"{OUTPUT_DIR}/{d}") if f.endswith('.jpg')]) 
                   for d in ["desktop_dark", "desktop_light", "mobile_dark", "mobile_light"] 
                   if os.path.exists(f"{OUTPUT_DIR}/{d}"))
        log(f"TOTAL: {total} screenshots")

if __name__ == "__main__":
    asyncio.run(main())
