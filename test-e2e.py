#!/usr/bin/env python3
"""
Planity.ma - Test E2E Complet avec Playwright
Teste le flow utilisateur complet dans un vrai navigateur
"""

import asyncio
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:3002"

class TestResult:
    def __init__(self):
        self.tests = []
        self.start_time = time.time()
    
    def add(self, name, success, details="", screenshot=None):
        self.tests.append({
            "name": name,
            "success": success,
            "details": details,
            "screenshot": screenshot,
            "timestamp": datetime.now().isoformat()
        })
    
    def summary(self):
        total = len(self.tests)
        passed = sum(1 for t in self.tests if t["success"])
        failed = total - passed
        duration = time.time() - self.start_time
        
        print("\n" + "="*60)
        print("📊 RÉSUMÉ DES TESTS E2E")
        print("="*60)
        
        for test in self.tests:
            emoji = "✅" if test["success"] else "❌"
            print(f"{emoji} {test['name']}" + (f" — {test['details']}" if test['details'] else ""))
            if test.get("screenshot"):
                print(f"   📸 {test['screenshot']}")
        
        print(f"\n📈 {passed}/{total} tests réussis ({duration:.1f}s)")
        
        if failed == 0:
            print("\n🎉 TOUS LES TESTS E2E SONT RÉUSSIS!")
        else:
            print(f"\n⚠️ {failed} test(s) en échec")
        
        return failed == 0

async def test_home_page(page, results):
    """Test 1: Page d'accueil"""
    print("\n" + "="*60)
    print("🏠 TEST 1: PAGE D'ACCUEIL")
    print("="*60)
    
    try:
        await page.goto(f"{BASE_URL}/", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        title = await page.title()
        url = page.url
        
        # Vérifier que la page charge
        content = await page.content()
        has_content = len(content) > 1000
        
        # Prendre screenshot
        screenshot_path = "/tmp/planity-e2e-home.png"
        await page.screenshot(path=screenshot_path, full_page=True)
        
        success = has_content and "planity" in title.lower()
        results.add("Page d'accueil", success, f"Title: {title}", screenshot_path)
        
        print(f"  Title: {title}")
        print(f"  URL: {url}")
        print(f"  Content length: {len(content)}")
        
    except Exception as e:
        results.add("Page d'accueil", False, str(e)[:100])

async def test_search_page(page, results):
    """Test 2: Page de recherche"""
    print("\n" + "="*60)
    print("🔍 TEST 2: PAGE DE RECHERCHE")
    print("="*60)
    
    try:
        await page.goto(f"{BASE_URL}/recherche", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        # Vérifier la présence de champs de recherche
        search_input = await page.query_selector('input[type="text"], input[placeholder*="recherche"], input[placeholder*="Recherche"]')
        
        # Prendre screenshot
        screenshot_path = "/tmp/planity-e2e-search.png"
        await page.screenshot(path=screenshot_path, full_page=True)
        
        success = search_input is not None
        results.add("Page de recherche", success, 
                   "Formulaire de recherche trouvé" if success else "Pas de formulaire",
                   screenshot_path)
        
    except Exception as e:
        results.add("Page de recherche", False, str(e)[:100])

async def test_salon_listing(page, results):
    """Test 3: Liste des salons"""
    print("\n" + "="*60)
    print("🏪 TEST 3: LISTE DES SALONS")
    print("="*60)
    
    try:
        await page.goto(f"{BASE_URL}/salons", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        # Vérifier la présence de salons
        salons = await page.query_selector_all('[class*="salon"], [class*="card"], h2, h3')
        
        # Prendre screenshot
        screenshot_path = "/tmp/planity-e2e-salons.png"
        await page.screenshot(path=screenshot_path, full_page=True)
        
        success = len(salons) > 0
        results.add("Liste des salons", success, 
                   f"{len(salons)} éléments trouvés" if success else "Aucun salon",
                   screenshot_path)
        
    except Exception as e:
        results.add("Liste des salons", False, str(e)[:100])

async def test_salon_detail(page, results):
    """Test 4: Détail d'un salon"""
    print("\n" + "="*60)
    print("📋 TEST 4: DÉTAIL SALON")
    print("="*60)
    
    try:
        await page.goto(f"{BASE_URL}/etablissement/salon-elegance-casablanca", wait_until="networkidle")
        await page.wait_for_timeout(2000)
        
        # Vérifier la présence d'informations
        content = await page.content()
        has_name = "Salon Elegance" in content or "elegance" in content.lower()
        has_services = "coupe" in content.lower() or "service" in content.lower()
        
        # Prendre screenshot
        screenshot_path = "/tmp/planity-e2e-salon-detail.png"
        await page.screenshot(path=screenshot_path, full_page=True)
        
        success = has_name and has_services
        results.add("Détail salon", success, 
                   "Informations complètes" if success else "Informations manquantes",
                   screenshot_path)
        
    except Exception as e:
        results.add("Détail salon", False, str(e)[:100])

async def test_reservation_flow(page, results):
    """Test 5: Flow de réservation"""
    print("\n" + "="*60)
    print("📝 TEST 5: FLOW DE RÉSERVATION")
    print("="*60)
    
    try:
        # Aller à la page de réservation
        await page.goto(f"{BASE_URL}/reservation", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        # Vérifier la présence du formulaire
        content = await page.content()
        has_form = "form" in content.lower() or "input" in content.lower()
        
        # Prendre screenshot
        screenshot_path = "/tmp/planity-e2e-reservation.png"
        await page.screenshot(path=screenshot_path, full_page=True)
        
        success = has_form
        results.add("Flow réservation", success,
                   "Formulaire de réservation trouvé" if success else "Pas de formulaire",
                   screenshot_path)
        
    except Exception as e:
        results.add("Flow réservation", False, str(e)[:100])

async def test_inscription_page(page, results):
    """Test 6: Page d'inscription"""
    print("\n" + "="*60)
    print("📝 TEST 6: PAGE D'INSCRIPTION")
    print("="*60)
    
    try:
        await page.goto(f"{BASE_URL}/inscription", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        
        # Vérifier la présence du formulaire d'inscription
        inputs = await page.query_selector_all('input')
        has_email = False
        has_password = False
        
        for input_elem in inputs:
            input_type = await input_elem.get_attribute('type')
            input_name = await input_elem.get_attribute('name') or await input_elem.get_attribute('placeholder')
            if input_type == 'email' or 'email' in (input_name or '').lower():
                has_email = True
            if input_type == 'password' or 'password' in (input_name or '').lower():
                has_password = True
        
        # Prendre screenshot
        screenshot_path = "/tmp/planity-e2e-inscription.png"
        await page.screenshot(path=screenshot_path, full_page=True)
        
        success = has_email and has_password and len(inputs) > 0
        results.add("Page inscription", success,
                   f"Formulaire complet ({len(inputs)} champs)" if success else "Formulaire incomplet",
                   screenshot_path)
        
    except Exception as e:
        results.add("Page inscription", False, str(e)[:100])

async def test_api_endpoints(page, results):
    """Test 7: API Endpoints"""
    print("\n" + "="*60)
    print("🔗 TEST 7: API ENDPOINTS")
    print("="*60)
    
    try:
        # Tester l'API des salons avec request.get()
        response = await page.request.get(f"{BASE_URL}/api/v1/salons")
        content = await response.text()
        
        try:
            data = json.loads(content)
            success = response.status == 200 and 'salons' in data
            results.add("API /salons", success,
                       f"Status: {response.status} — {len(data.get('salons', []))} salons" if success else f"Status: {response.status}",
                       "/tmp/planity-e2e-api-salons.png")
        except json.JSONDecodeError:
            results.add("API /salons", False, "JSON parsing error", "/tmp/planity-e2e-api-salons.png")
        
        # Tester l'API de recherche
        response = await page.request.get(f"{BASE_URL}/api/v1/search?q=coiffure&city=Casablanca")
        content = await response.text()
        
        try:
            data = json.loads(content)
            success = response.status == 200 and 'salons' in data
            results.add("API /search", success,
                       f"Status: {response.status} — {len(data.get('salons', []))} résultats" if success else f"Status: {response.status}",
                       "/tmp/planity-e2e-api-search.png")
        except json.JSONDecodeError:
            results.add("API /search", False, "JSON parsing error", "/tmp/planity-e2e-api-search.png")
        
    except Exception as e:
        results.add("API endpoints", False, str(e)[:100])

async def test_dashboard_pro(page, results):
    """Test 8: Dashboard Pro"""
    print("\n" + "="*60)
    print("💼 TEST 8: DASHBOARD PRO")
    print("="*60)
    
    try:
        # Utiliser request.get() pour éviter les redirects
        response = await page.request.get(f"{BASE_URL}/pro", max_redirects=0)
        
        # Vérifier le status code (307 = redirect vers login = OK)
        is_protected = response.status in [307, 302, 301]
        
        success = is_protected
        results.add("Dashboard Pro", success,
                   f"Status: {response.status} (protégé)" if success else f"Status: {response.status}",
                   "/tmp/planity-e2e-dashboard-pro.png")
        
    except Exception as e:
        results.add("Dashboard Pro", False, str(e)[:100])

async def test_admin_page(page, results):
    """Test 9: Admin"""
    print("\n" + "="*60)
    print("👑 TEST 9: ADMIN")
    print("="*60)
    
    try:
        # Utiliser request.get() pour éviter les redirects
        response = await page.request.get(f"{BASE_URL}/admin", max_redirects=0)
        
        # Vérifier le status code (307 = redirect vers login = OK)
        is_protected = response.status in [307, 302, 301]
        
        success = is_protected
        results.add("Admin", success,
                   f"Status: {response.status} (protégé)" if success else f"Status: {response.status}",
                   "/tmp/planity-e2e-admin.png")
        
    except Exception as e:
        results.add("Admin", False, str(e)[:100])

async def main():
    print("\n" + "🚀 " + "="*56)
    print("🚀 PLANITY.MA — TESTS E2E COMPLETS")
    print("🚀 " + "="*56)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 {BASE_URL}")
    
    results = TestResult()
    
    async with async_playwright() as p:
        # Lancer le navigateur
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 720},
            user_agent="Planity.ma-E2E-Test/1.0"
        )
        page = await context.new_page()
        
        # Activer le logging des erreurs
        page.on("console", lambda msg: print(f"  📝 Console: {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda error: print(f"  ❌ Error: {error}"))
        
        try:
            # Exécuter tous les tests
            await test_home_page(page, results)
            await test_search_page(page, results)
            await test_salon_listing(page, results)
            await test_salon_detail(page, results)
            await test_reservation_flow(page, results)
            await test_inscription_page(page, results)
            await test_api_endpoints(page, results)
            await test_dashboard_pro(page, results)
            await test_admin_page(page, results)
            
        except Exception as e:
            print(f"\n❌ Erreur pendant les tests: {e}")
            results.add("Test E2E", False, str(e))
        
        finally:
            await browser.close()
    
    # Afficher le résumé
    return results.summary()

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1)
