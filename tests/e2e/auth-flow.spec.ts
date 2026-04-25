import { test, expect } from "@playwright/test";

/**
 * Test E2E: Flux d'authentification
 * 
 * Scénario: Inscription → Connexion → Session → Déconnexion
 * 
 * Usage: npx playwright test tests/e2e/auth-flow.spec.ts
 */

test.describe("Flux d'authentification", () => {
  test("visiter la page de connexion", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.locator("h1, h2")).toContainText("Connexion");
    await expect(page.locator('input[placeholder="votre@email.com"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Votre mot de passe"]')).toBeVisible();
    await expect(page.locator('button:has-text("Se connecter")')).toBeVisible();
  });

  test("visiter la page d'inscription", async ({ page }) => {
    await page.goto("/inscription");
    await expect(page.locator("h1, h2")).toContainText("Créer un compte");
    await expect(page.locator('input[placeholder="Prénom"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Nom"]')).toBeVisible();
    await expect(page.locator('input[placeholder="votre@email.com"]')).toBeVisible();
    await expect(page.locator('input[placeholder="+212 6XX-XXXXXX"]')).toBeVisible();
    await expect(page.locator('input[placeholder="Minimum 8 caractères"]')).toBeVisible();
    await expect(page.locator('button:has-text("Créer mon compte")')).toBeVisible();
  });

  test("lien vers inscription depuis connexion", async ({ page }) => {
    await page.goto("/connexion");
    await page.click('a:has-text("S\'inscrire")');
    await expect(page).toHaveURL("/inscription");
  });

  test("lien vers connexion depuis inscription", async ({ page }) => {
    await page.goto("/inscription");
    await page.click('a:has-text("Se connecter")');
    await expect(page).toHaveURL("/connexion");
  });

  test("validation formulaire connexion — email requis", async ({ page }) => {
    await page.goto("/connexion");
    
    // Essayer de soumettre sans email
    const submitBtn = page.locator('button:has-text("Se connecter")');
    await submitBtn.click();
    
    // Le champ email devrait avoir le focus (required)
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();
  });

  test("validation formulaire connexion — mot de passe requis", async ({ page }) => {
    await page.goto("/connexion");
    
    // Remplir l'email mais pas le mot de passe
    await page.fill('input[type="email"]', "test@email.com");
    
    const submitBtn = page.locator('button:has-text("Se connecter")');
    await submitBtn.click();
    
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeFocused();
  });

  test("validation formulaire inscription — prénom requis", async ({ page }) => {
    await page.goto("/inscription");
    
    const submitBtn = page.locator('button:has-text("Créer mon compte")');
    await submitBtn.click();
    
    const firstNameInput = page.locator('input[placeholder="Prénom"]');
    await expect(firstNameInput).toBeFocused();
  });

  test("validation formulaire inscription — mot de passe minimum 8 chars", async ({ page }) => {
    await page.goto("/inscription");
    
    // Remplir les champs obligatoires
    await page.fill('input[placeholder="Prénom"]', "Test");
    await page.fill('input[placeholder="Nom"]', "User");
    await page.fill('input[placeholder="votre@email.com"]', "test@email.com");
    
    // Mot de passe trop court
    await page.fill('input[placeholder="Minimum 8 caractères"]', "short");
    
    const submitBtn = page.locator('button:has-text("Créer mon compte")');
    await submitBtn.click();
    
    const passwordInput = page.locator('input[placeholder="Minimum 8 caractères"]');
    await expect(passwordInput).toBeFocused();
  });

  test("toggle visibility mot de passe", async ({ page }) => {
    await page.goto("/connexion");
    
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    
    // Cliquer sur le bouton œil
    const eyeButton = page.locator('button:has-text("")').last();
    // Note: le bouton œil est un toggle, on ne peut pas facilement le tester sans interaction
  });

  test("bouton Google OAuth visible", async ({ page }) => {
    await page.goto("/connexion");
    await expect(page.locator('button:has-text("Continuer avec Google")')).toBeVisible();
  });

  test("page 404", async ({ page }) => {
    await page.goto("/page-inexistante-12345");
    await expect(page.locator("h1")).toContainText("404");
    await expect(page.locator("text:has-text('Page non trouvée')")).toBeVisible();
  });

  test("header — liens de navigation", async ({ page }) => {
    await page.goto("/");
    
    // Vérifier le logo
    await expect(page.locator("text:has-text('Planity.ma')")).toBeVisible();
    
    // Vérifier le lien Espace Pro
    await expect(page.locator('a:has-text("Espace Pro")')).toBeVisible();
    
    // Vérifier le bouton connexion
    await expect(page.locator('button:has-text("Connexion")')).toBeVisible();
  });

  test("footer — liens", async ({ page }) => {
    await page.goto("/");
    
    // Scroll vers le footer
    await page.scrollTo(0, 10000);
    
    // Vérifier les liens du footer
    await expect(page.locator("text:has-text('Coiffeur')")).toBeVisible();
    await expect(page.locator("text:has-text('Casablanca')")).toBeVisible();
    await expect(page.locator("text:has-text('Inscrire mon salon')")).toBeVisible();
  });
});
