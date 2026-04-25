import { test, expect } from "@playwright/test";

/**
 * Test E2E: Parcours consommateur complet
 * 
 * Scénario: Accueil → Recherche → Salon → Réservation → Confirmation
 * 
 * Usage: npx playwright test tests/e2e/consumer-flow.spec.ts
 */

test.describe("Parcours consommateur", () => {
  test("visiter la page d'accueil et vérifier le contenu", async ({ page }) => {
    await page.goto("/");
    
    // Vérifier le titre
    await expect(page).toHaveTitle(/Planity\.ma/);
    
    // Vérifier le hero
    await expect(page.locator("h1")).toContainText("rendez-vous beauté");
    
    // Vérifier la barre de recherche
    await expect(page.locator('input[placeholder="Rechercher un salon, un service..."]')).toBeVisible();
    
    // Vérifier la sélection de ville
    await expect(page.locator('select')).toBeVisible();
    
    // Vérifier le bouton rechercher
    await expect(page.locator('button:has-text("Rechercher")')).toBeVisible();
    
    // Vérifier les stats
    await expect(page.locator("text:has-text('Salons partenaires')")).toBeVisible();
    await expect(page.locator("text:has-text('Réservations par mois')")).toBeVisible();
    await expect(page.locator("text:has-text('Villes au Maroc')")).toBeVisible();
  });

  test("rechercher un salon par catégorie", async ({ page }) => {
    await page.goto("/");
    
    // Cliquer sur une catégorie
    await page.click('a:has-text("Coiffeur")');
    
    // Vérifier la navigation vers la page de recherche
    await expect(page).toHaveURL(/\/recherche/);
  });

  test("rechercher par ville", async ({ page }) => {
    await page.goto("/");
    
    // Sélectionner une ville
    await page.selectOption('select', "Casablanca");
    
    // Cliquer sur rechercher
    await page.click('button:has-text("Rechercher")');
    
    // Vérifier l'URL
    await expect(page).toHaveURL(/\/recherche.*city=Casablanca/);
  });

  test("voir la page d'un salon", async ({ page }) => {
    await page.goto("/etablissement/salon-elegance-casablanca");
    
    // Vérifier le nom du salon
    await expect(page.locator("h1")).toContainText("Salon Elegance");
    
    // Vérifier la section services
    await expect(page.locator("text=Services")).toBeVisible();
    
    // Vérifier la section équipe
    await expect(page.locator("text=L'équipe")).toBeVisible();
    
    // Vérifier la section avis
    await expect(page.locator("text=Avis clients")).toBeVisible();
    
    // Vérifier le bouton de réservation
    await expect(page.locator('button:has-text("Prendre rendez-vous")')).toBeVisible();
    
    // Vérifier les horaires
    await expect(page.locator("text=Horaires")).toBeVisible();
  });

  test("flow de réservation complet", async ({ page }) => {
    await page.goto("/reservation/1");
    
    // Étape 1: Sélection des services
    await expect(page.locator("h1")).toContainText("Prendre rendez-vous");
    await expect(page.locator("text=Choisissez vos services")).toBeVisible();
    
    // Vérifier le stepper
    await expect(page.locator("text=Service")).toBeVisible();
    await expect(page.locator("text=Professionnel")).toBeVisible();
    await expect(page.locator("text=Date & Heure")).toBeVisible();
    await expect(page.locator("text=Confirmation")).toBeVisible();
    
    // Sélectionner un service
    await page.click('button:has-text("Coupe femme")');
    
    // Vérifier la sélection
    const coupeBtn = page.locator('button:has-text("Coupe femme")');
    await expect(coupeBtn).toHaveClass(/border-rose-500/);
    
    // Passer à l'étape 2
    await page.click('button:has-text("Suivant")');
    
    // Étape 2: Sélection du professionnel
    await expect(page.locator("text=Choisissez votre professionnel")).toBeVisible();
    
    // Sélectionner un professionnel
    await page.click('button:has-text("Sara M.")');
    
    // Passer à l'étape 3
    await page.click('button:has-text("Suivant")');
    
    // Étape 3: Date et heure
    await expect(page.locator("text=Choisissez la date")).toBeVisible();
    
    // Sélectionner une date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    await page.fill('input[type="date"]', dateStr);
    
    // Sélectionner un créneau
    await page.click('button:text("14:00")');
    
    // Passer à l'étape 4
    await page.click('button:has-text("Suivant")');
    
    // Étape 4: Confirmation
    await expect(page.locator("text=Confirmation")).toBeVisible();
    
    // Vérifier le résumé
    await expect(page.locator("text=Coupe femme")).toBeVisible();
    await expect(page.locator("text=Sara M.")).toBeVisible();
    await expect(page.locator("text=Confirmer la réservation")).toBeVisible();
  });

  test("navigation retour en arrière pendant réservation", async ({ page }) => {
    await page.goto("/reservation/1");
    
    // Sélectionner un service
    await page.click('button:has-text("Coupe femme")');
    
    // Avancer
    await page.click('button:has-text("Suivant")');
    await expect(page.locator("text=Choisissez votre professionnel")).toBeVisible();
    
    // Retour
    await page.click('button:has-text("Retour")');
    await expect(page.locator("text=Choisissez vos services")).toBeVisible();
  });

  test("voir ses rendez-vous", async ({ page }) => {
    await page.goto("/mes-rendez-vous");
    await expect(page.locator("h1")).toContainText("Mes rendez-vous");
  });

  test("voir ses favoris", async ({ page }) => {
    await page.goto("/favoris");
    await expect(page.locator("h1")).toContainText("Mes favoris");
  });

  test("responsive mobile — menu hamburger", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    
    // Le menu desktop ne devrait pas être visible
    const desktopNav = page.locator("nav.hidden.md\\:flex");
    await expect(desktopNav).not.toBeVisible();
    
    // Le bouton menu mobile devrait être visible
    await expect(page.locator("button.md\\:hidden")).toBeVisible();
  });

  test("responsive mobile — navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    
    // Ouvrir le menu mobile
    await page.click("button.md\\:hidden");
    
    // Vérifier les liens du menu
    await expect(page.locator("text=Mes rendez-vous")).toBeVisible();
    await expect(page.locator("text=Favoris")).toBeVisible();
    await expect(page.locator("text=Espace Pro")).toBeVisible();
  });
});
