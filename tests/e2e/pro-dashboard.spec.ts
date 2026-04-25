import { test, expect } from "@playwright/test";

/**
 * Test E2E: Dashboard professionnel
 * 
 * Scénario: Agenda → Clients → Services → Équipe → Caisse → Stock → Stats → Paramètres
 * 
 * Usage: npx playwright test tests/e2e/pro-dashboard.spec.ts
 */

test.describe("Dashboard professionnel", () => {
  test("voir l'agenda", async ({ page }) => {
    await page.goto("/pro/agenda");
    await expect(page.locator("h1")).toContainText("Agenda");
    
    // Vérifier les boutons de vue
    await expect(page.locator('button:has-text("Jour")')).toBeVisible();
    await expect(page.locator('button:has-text("Semaine")')).toBeVisible();
    
    // Vérifier le bouton nouveau RDV
    await expect(page.locator('button:has-text("Nouveau RDV")')).toBeVisible();
    
    // Vérifier les colonnes staff
    await expect(page.locator("text=Sara M.")).toBeVisible();
    await expect(page.locator("text=Karim B.")).toBeVisible();
    await expect(page.locator("text=Nadia L.")).toBeVisible();
  });

  test("navigation agenda — vue jour/semaine", async ({ page }) => {
    await page.goto("/pro/agenda");
    
    // Toggle vue semaine
    await page.click('button:has-text("Semaine")');
    
    // Toggle vue jour
    await page.click('button:has-text("Jour")');
  });

  test("navigation agenda — dates", async ({ page }) => {
    await page.goto("/pro/agenda");
    
    // Cliquer sur "Aujourd'hui"
    await page.click('button:has-text("Aujourd\'hui")');
    
    // Navigation précédente
    await page.click('button[aria-label]:has-text("ChevronLeft"), button:has-text(".chevron-left")');
  });

  test("voir la page clients", async ({ page }) => {
    await page.goto("/pro/clients");
    await expect(page.locator("h1")).toContainText("Clients");
    await expect(page.locator('button:has-text("Nouveau client")')).toBeVisible();
  });

  test("rechercher un client", async ({ page }) => {
    await page.goto("/pro/clients");
    await page.fill('input[placeholder="Rechercher par nom, email ou téléphone..."]', "Fatima");
    await expect(page.locator("text=Fatima Zahri")).toBeVisible();
  });

  test("voir la page services", async ({ page }) => {
    await page.goto("/pro/services");
    await expect(page.locator("h1")).toContainText("Services");
    await expect(page.locator('button:has-text("Nouveau service")')).toBeVisible();
  });

  test("voir la page équipe", async ({ page }) => {
    await page.goto("/pro/equipe");
    await expect(page.locator("h1")).toContainText("Équipe");
    await expect(page.locator('button:has-text("Ajouter un membre")')).toBeVisible();
  });

  test("voir la page caisse", async ({ page }) => {
    await page.goto("/pro/caisse");
    await expect(page.locator("h1")).toContainText("Caisse");
    await expect(page.locator("text:has-text('Panier vide')")).toBeVisible();
  });

  test("ajouter un service au panier de caisse", async ({ page }) => {
    await page.goto("/pro/caisse");
    
    // Cliquer sur un service
    await page.click('button:has-text("Coupe femme")');
    
    // Vérifier que le panier est mis à jour
    await expect(page.locator('text:has-text("Panier")')).toBeVisible();
  });

  test("voir la page stock", async ({ page }) => {
    await page.goto("/pro/stock");
    await expect(page.locator("h1")).toContainText("Stock");
    await expect(page.locator('button:has-text("Nouveau produit")')).toBeVisible();
  });

  test("voir les KPIs stock", async ({ page }) => {
    await page.goto("/pro/stock");
    await expect(page.locator("text:has-text('Total produits')")).toBeVisible();
    await expect(page.locator("text:has-text('Valeur du stock')")).toBeVisible();
    await expect(page.locator("text:has-text('Alertes stock bas')")).toBeVisible();
  });

  test("voir la page statistiques", async ({ page }) => {
    await page.goto("/pro/statistiques");
    await expect(page.locator("h1")).toContainText("Statistiques");
  });

  test("voir les KPIs statistiques", async ({ page }) => {
    await page.goto("/pro/statistiques");
    await expect(page.locator("text:has-text('Chiffre d\\'affaires')")).toBeVisible();
    await expect(page.locator("text:has-text('Réservations')")).toBeVisible();
    await expect(page.locator("text:has-text('Nouveaux clients')")).toBeVisible();
    await expect(page.locator("text:has-text('Taux d\\'occupation')")).toBeVisible();
  });

  test("changer la période statistiques", async ({ page }) => {
    await page.goto("/pro/statistiques");
    
    // Cliquer sur "Semaine"
    await page.click('button:has-text("Semaine")');
    
    // Cliquer sur "Jour"
    await page.click('button:has-text("Jour")');
    
    // Cliquer sur "Année"
    await page.click('button:has-text("Année")');
  });

  test("voir la page paramètres", async ({ page }) => {
    await page.goto("/pro/parametres");
    await expect(page.locator("h1")).toContainText("Paramètres");
  });

  test("voir les sections paramètres", async ({ page }) => {
    await page.goto("/pro/parametres");
    await expect(page.locator("text=Informations du salon")).toBeVisible();
    await expect(page.locator("text=Photos du salon")).toBeVisible();
    await expect(page.locator("text=Horaires d'ouverture")).toBeVisible();
    await expect(page.locator("text=Notifications")).toBeVisible();
    await expect(page.locator("text=Paiements (Stripe)")).toBeVisible();
    await expect(page.locator("text=Zone de danger")).toBeVisible();
  });
});
