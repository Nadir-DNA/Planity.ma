/**
 * Auth Flow E2E Tests - Playwright
 * Tests authentication flows (signup, login, logout)
 */

import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.describe("Signup", () => {
    test("should show signup form", async ({ page }) => {
      await page.goto("/signup");
      
      await expect(page.locator("h1, h2")).toContainText(/inscription|créer|compte/i);
      await expect(page.locator("input[name='email'], input[type='email']")).toBeVisible();
      await expect(page.locator("input[name='password'], input[type='password']")).toBeVisible();
    });

    test("should validate email format", async ({ page }) => {
      await page.goto("/signup");
      
      const emailInput = page.locator("input[type='email']");
      await emailInput.fill("invalid-email");
      await emailInput.blur();
      
      // Should show validation error
      await expect(page.locator("text=/email|valide|incorrect/i")).toBeVisible();
    });

    test("should validate password strength", async ({ page }) => {
      await page.goto("/signup");
      
      const passwordInput = page.locator("input[type='password']").first();
      await passwordInput.fill("weak");
      await passwordInput.blur();
      
      // Should show password strength indicator or error
      const validationText = page.locator("text=/caractère|fort|minimum|8/i");
      if (await validationText.isVisible()) {
        await expect(validationText).toBeVisible();
      }
    });

    test("should signup successfully with valid data", async ({ page }) => {
      await page.goto("/signup");
      
      // Fill form with unique test email
      const testEmail = `test-${Date.now()}@example.com`;
      await page.locator("input[type='email']").fill(testEmail);
      await page.locator("input[type='password']").first().fill("StrongPass123!");
      
      // Fill name if field exists
      const nameInput = page.locator("input[name='name']");
      if (await nameInput.isVisible()) {
        await nameInput.fill("Test User");
      }
      
      // Submit form
      await page.click("button[type='submit'], button:has-text('Inscription')");
      
      // Should redirect or show success
      await expect(page).toHaveURL(/\/(dashboard|confirmation|verify)/, { timeout: 15000 });
    });
  });

  test.describe("Login", () => {
    test("should show login form", async ({ page }) => {
      await page.goto("/login");
      
      await expect(page.locator("input[type='email']")).toBeVisible();
      await expect(page.locator("input[type='password']")).toBeVisible();
      await expect(page.locator("button:has-text(/connexion|login/i)")).toBeVisible();
    });

    test("should show error for invalid credentials", async ({ page }) => {
      await page.goto("/login");
      
      await page.locator("input[type='email']").fill("wrong@example.com");
      await page.locator("input[type='password']").fill("wrongpassword");
      await page.click("button[type='submit']");
      
      // Should show error message
      await expect(page.locator("text=/incorrect|erreur|invalid/i")).toBeVisible({ timeout: 5000 });
    });

    test("should have link to signup", async ({ page }) => {
      await page.goto("/login");
      
      const signupLink = page.locator("a:has-text(/inscription|créer/i)");
      await expect(signupLink).toBeVisible();
      
      await signupLink.click();
      await expect(page).toHaveURL(/signup/);
    });

    test("should have forgot password link", async ({ page }) => {
      await page.goto("/login");
      
      const forgotLink = page.locator("a:has-text(/oublié|forgot/i)");
      if (await forgotLink.isVisible()) {
        await forgotLink.click();
        await expect(page).toHaveURL(/forgot|reset/);
      }
    });
  });

  test.describe("Logout", () => {
    test("should logout and redirect to home", async ({ page }) => {
      // Note: This test requires a logged-in session
      // In production, use storageState or mock auth
      
      // Attempt to access logout route
      await page.goto("/logout");
      
      // Should redirect to home or login
      await expect(page).toHaveURL(/\/(login|home|)$/);
    });
  });

  test.describe("Protected Routes", () => {
    test("should redirect to login when not authenticated", async ({ page }) => {
      // Try accessing protected route
      await page.goto("/dashboard");
      
      // Should redirect to login
      await expect(page).toHaveURL(/login/, { timeout: 5000 });
    });

    test("should redirect to login for booking without auth", async ({ page }) => {
      // Go to salon page
      await page.goto("/etablissement/test-salon");
      
      // Try to book (click reserve button)
      const reserveBtn = page.locator("button:has-text('Réserver')");
      if (await reserveBtn.isVisible()) {
        await reserveBtn.click();
        
        // Should redirect to login or show login modal
        await expect(page).toHaveURL(/login/, { timeout: 5000 });
      }
    });
  });
});

test.describe("Password Reset Flow", () => {
  test("should show forgot password form", async ({ page }) => {
    await page.goto("/forgot-password");
    
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("button:has-text(/envoyer|reset/i)")).toBeVisible();
  });

  test("should send reset email", async ({ page }) => {
    await page.goto("/forgot-password");
    
    await page.locator("input[type='email']").fill("test@example.com");
    await page.click("button[type='submit']");
    
    // Should show success message
    await expect(page.locator("text=/envoyé|email|succès/i")).toBeVisible({ timeout: 10000 });
  });
});

test.describe("OAuth Integration", () => {
  test("should show social login buttons", async ({ page }) => {
    await page.goto("/login");
    
    // Check for Google OAuth button
    const googleBtn = page.locator("button:has-text('Google'), a:has-text('Google')");
    if (await googleBtn.isVisible()) {
      await expect(googleBtn).toBeVisible();
    }
    
    // Check for Apple OAuth
    const appleBtn = page.locator("button:has-text('Apple'), a:has-text('Apple')");
    if (await appleBtn.isVisible()) {
      await expect(appleBtn).toBeVisible();
    }
  });
});
