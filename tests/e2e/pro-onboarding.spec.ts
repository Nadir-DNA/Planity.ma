import { test, expect } from "@playwright/test";

/**
 * Test E2E: Onboarding professionnel
 * 
 * Scénario: Inscription → Configuration salon → Agenda
 * 
 * Usage: npx playwright test tests/e2e/pro-onboarding.spec.ts
 */

test.describe("Onboarding professionnel", () => {
  test("visiter la page d'inscription pro", async ({ page }) => {
    await page.goto("/pro/inscription");
    await expect(page.locator("h1")).toContainText("Inscrivez votre salon");
    
    // Vérifier le stepper
    await expect(page.locator("text=Votre salon")).toBeVisible();
    await expect(page.locator("text=Horaires")).toBeVisible();
    await expect(page.locator("text=Services")).toBeVisible();
    await expect(page.locator("text=Équipe")).toBeVisible();
  });

  test("étape 1: remplir les informations du salon", async ({ page }) => {
    await page.goto("/pro/inscription");
    
    // Vérifier que nous sommes à l'étape 1
    await expect(page.locator("text=Informations de votre salon")).toBeVisible();
    
    // Remplir le formulaire
    await page.fill('input[placeholder="Ex: Salon Elegance"]', "Salon Test");
    await page.selectOption('select', "coiffeur");
    await page.fill('input[placeholder="123 Boulevard Mohammed V"]', "456 Rue Test");
    await page.selectOption('select', "Rabat");
    await page.fill('input[placeholder="+212 5XX-XXXXXX"]', "+212537123456");
    await page.fill('input[placeholder="contact@monsalon.ma"]', "test@salon.ma");
    
    // Passer à l'étape suivante
    await page.click('button:has-text("Suivant")');
    
    // Vérifier que nous sommes à l'étape 2
    await expect(page.locator("text=Horaires d'ouverture")).toBeVisible();
  });

  test("étape 2: configurer les horaires", async ({ page }) => {
    await page.goto("/pro/inscription");
    await page.click('button:has-text("Suivant")');
    
    await expect(page.locator("text=Horaires d'ouverture")).toBeVisible();
    
    // Vérifier que les jours sont affichés
    await expect(page.locator("text=Lundi")).toBeVisible();
    await expect(page.locator("text=Mardi")).toBeVisible();
    await expect(page.locator("text=Mercredi")).toBeVisible();
    await expect(page.locator("text=Jeudi")).toBeVisible();
    await expect(page.locator("text=Vendredi")).toBeVisible();
    await expect(page.locator("text=Samedi")).toBeVisible();
    await expect(page.locator("text=Dimanche")).toBeVisible();
    
    // Passer à l'étape 3
    await page.click('button:has-text("Suivant")');
    await expect(page.locator("text=Vos services")).toBeVisible();
  });

  test("étape 3: ajouter des services", async ({ page }) => {
    await page.goto("/pro/inscription");
    await page.click('button:has-text("Suivant")');
    await page.click('button:has-text("Suivant")');
    
    await expect(page.locator("text=Vos services")).toBeVisible();
    await expect(page.locator('button:has-text("Ajouter un service")')).toBeVisible();
    
    // Passer à l'étape 4
    await page.click('button:has-text("Suivant")');
    await expect(page.locator("text=Votre équipe")).toBeVisible();
  });

  test("étape 4: ajouter des membres d'équipe", async ({ page }) => {
    await page.goto("/pro/inscription");
    await page.click('button:has-text("Suivant")');
    await page.click('button:has-text("Suivant")');
    await page.click('button:has-text("Suivant")');
    
    await expect(page.locator("text=Votre équipe")).toBeVisible();
    await expect(page.locator('button:has-text("Ajouter un membre")')).toBeVisible();
    
    // Vérifier le message de fin
    await expect(page.locator("text=Votre salon est prêt")).toBeVisible();
  });

  test("navigation retour en arrière", async ({ page }) => {
    await page.goto("/pro/inscription");
    
    // Aller à l'étape 2
    await page.click('button:has-text("Suivant")');
    await expect(page.locator("text=Horaires d'ouverture")).toBeVisible();
    
    // Retour à l'étape 1
    await page.click('button:has-text("Retour")');
    await expect(page.locator("text=Informations de votre salon")).toBeVisible();
    
    // Avancer à nouveau
    await page.click('button:has-text("Suivant")');
    await expect(page.locator("text=Horaires d'ouverture")).toBeVisible();
  });

  test("terminer l'inscription", async ({ page }) => {
    await page.goto("/pro/inscription");
    
    // Passer toutes les étapes
    await page.click('button:has-text("Suivant")');
    await page.click('button:has-text("Suivant")');
    await page.click('button:has-text("Suivant")');
    
    // À l'étape 4, cliquer sur Terminer
    await expect(page.locator("text=Votre salon est prêt")).toBeVisible();
    await page.click('button:has-text("Terminer")');
  });
});
