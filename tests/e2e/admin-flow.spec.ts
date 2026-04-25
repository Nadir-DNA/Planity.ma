import { test, expect } from "@playwright/test";

/**
 * Test E2E: Panel administrateur
 * 
 * Scénario: Dashboard → Modération → Gestion
 * 
 * Usage: npx playwright test tests/e2e/admin-flow.spec.ts
 */

test.describe("Panel administrateur", () => {
  test("voir le dashboard admin", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard Plateforme");
  });

  test("voir les KPIs dashboard", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.locator("text:has-text('Utilisateurs totaux')")).toBeVisible();
    await expect(page.locator("text:has-text('Salons actifs')")).toBeVisible();
    await expect(page.locator("text:has-text('Réservations')")).toBeVisible();
    await expect(page.locator("text:has-text('Volume transactions')")).toBeVisible();
  });

  test("voir le graphique de croissance", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.locator("text:has-text('Croissance utilisateurs')")).toBeVisible();
  });

  test("voir l'activité récente", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.locator("text:has-text('Activité récente')")).toBeVisible();
  });

  test("voir les top villes", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.locator("text:has-text('Top villes par réservations')")).toBeVisible();
    await expect(page.locator("text:has-text('Casablanca')")).toBeVisible();
    await expect(page.locator("text:has-text('Rabat')")).toBeVisible();
    await expect(page.locator("text:has-text('Marrakech')")).toBeVisible();
  });

  test("voir les établissements", async ({ page }) => {
    await page.goto("/admin/etablissements");
    await expect(page.locator("h1")).toContainText("Établissements");
  });

  test("filtrer les établissements par statut", async ({ page }) => {
    await page.goto("/admin/etablissements");
    
    // Filtrer par "En attente"
    await page.click('button:has-text("En attente")');
    
    // Filtrer par "Actifs"
    await page.click('button:has-text("Actifs")');
    
    // Filtrer par "Rejetés"
    await page.click('button:has-text("Rejetés")');
    
    // Tout afficher
    await page.click('button:has-text("Tous")');
  });

  test("rechercher un établissement", async ({ page }) => {
    await page.goto("/admin/etablissements");
    await page.fill('input[placeholder="Rechercher..."]', "Salon");
  });

  test("voir les utilisateurs", async ({ page }) => {
    await page.goto("/admin/utilisateurs");
    await expect(page.locator("h1")).toContainText("Utilisateurs");
  });

  test("rechercher un utilisateur", async ({ page }) => {
    await page.goto("/admin/utilisateurs");
    await page.fill('input[placeholder="Rechercher par nom ou email..."]', "Fatima");
  });

  test("voir les badges de rôle", async ({ page }) => {
    await page.goto("/admin/utilisateurs");
    await expect(page.locator("text:has-text('Admin')")).toBeVisible();
    await expect(page.locator("text:has-text('Pro')")).toBeVisible();
    await expect(page.locator("text:has-text('Client')")).toBeVisible();
  });

  test("voir les avis", async ({ page }) => {
    await page.goto("/admin/avis");
    await expect(page.locator("h1")).toContainText("Avis clients");
  });

  test("filtrer les avis par statut", async ({ page }) => {
    await page.goto("/admin/avis");
    
    await page.click('button:has-text("En attente")');
    await page.click('button:has-text("Approuvés")');
    await page.click('button:has-text("Rejetés")');
  });

  test("voir le contenu", async ({ page }) => {
    await page.goto("/admin/contenu");
    await expect(page.locator("h1")).toContainText("Contenu");
  });

  test("voir les finances", async ({ page }) => {
    await page.goto("/admin/finances");
    await expect(page.locator("h1")).toContainText("Finances");
  });

  test("voir les KPIs finances", async ({ page }) => {
    await page.goto("/admin/finances");
    await expect(page.locator("text:has-text('Revenus ce mois')")).toBeVisible();
    await expect(page.locator("text:has-text('Commissions')")).toBeVisible();
    await expect(page.locator("text:has-text('Remboursements')")).toBeVisible();
    await expect(page.locator("text:has-text('En attente')")).toBeVisible();
  });

  test("voir les analytiques", async ({ page }) => {
    await page.goto("/admin/analytiques");
    await expect(page.locator("h1")).toContainText("Analytiques");
  });

  test("voir les KPIs analytiques", async ({ page }) => {
    await page.goto("/admin/analytiques");
    await expect(page.locator("text:has-text('Visiteurs ce mois')")).toBeVisible();
    await expect(page.locator("text:has-text('Taux de conversion')")).toBeVisible();
    await expect(page.locator("text:has-text('RDV/mois')")).toBeVisible();
    await expect(page.locator("text:has-text('Taux de rétention')")).toBeVisible();
  });

  test("voir le graphique croissance analytiques", async ({ page }) => {
    await page.goto("/admin/analytiques");
    await expect(page.locator("text:has-text('Croissance')")).toBeVisible();
  });

  test("voir le sidebar admin", async ({ page }) => {
    await page.goto("/admin/dashboard");
    
    await expect(page.locator("text:has-text('Dashboard')")).toBeVisible();
    await expect(page.locator("text:has-text('Établissements')")).toBeVisible();
    await expect(page.locator("text:has-text('Utilisateurs')")).toBeVisible();
    await expect(page.locator("text:has-text('Avis')")).toBeVisible();
    await expect(page.locator("text:has-text('Contenu')")).toBeVisible();
    await expect(page.locator("text:has-text('Finances')")).toBeVisible();
    await expect(page.locator("text:has-text('Analytiques')")).toBeVisible();
  });

  test("navigation sidebar admin", async ({ page }) => {
    await page.goto("/admin/dashboard");
    
    // Cliquer sur "Établissements"
    await page.click('a:has-text("Établissements")');
    await expect(page).toHaveURL("/admin/etablissements");
    
    // Cliquer sur "Utilisateurs"
    await page.click('a:has-text("Utilisateurs")');
    await expect(page).toHaveURL("/admin/utilisateurs");
    
    // Cliquer sur "Avis"
    await page.click('a:has-text("Avis")');
    await expect(page).toHaveURL("/admin/avis");
  });
});
