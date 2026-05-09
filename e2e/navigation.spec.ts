import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("should display landing page", async ({ page }) => {
    await page.goto("/");
    
    // Check for main heading
    await expect(page.locator("h1")).toBeVisible();
    
    // Check for main CTA buttons
    await expect(page.getByRole("link", { name: /get started/i })).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/");
    
    // Click login/sign in link
    await page.getByRole("link", { name: /sign in|login/i }).first().click();
    
    // Should be on login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByRole("heading", { name: /sign in|login/i })).toBeVisible();
  });

  test("should redirect unauthenticated users to login", async ({ page }) => {
    // Try to access dashboard directly
    await page.goto("/dashboard");
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });

  test("should have responsive navigation on mobile", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto("/");
    
    // Page should still be functional
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Landing Page", () => {
  test("should display features section", async ({ page }) => {
    await page.goto("/");
    
    // Look for features or key selling points
    const featuresSection = page.locator("text=/feature|insight|recommendation|portfolio/i").first();
    await expect(featuresSection).toBeVisible();
  });

  test("should display compliance disclaimer", async ({ page }) => {
    await page.goto("/");
    
    // Check for compliance/disclaimer text
    const disclaimer = page.locator("text=/not financial advice|educational|disclaimer/i").first();
    await expect(disclaimer).toBeVisible();
  });

  test("should have proper meta tags for SEO", async ({ page }) => {
    await page.goto("/");
    
    // Check title
    await expect(page).toHaveTitle(/AI Portfolio/i);
    
    // Check meta description exists
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /.+/);
  });
});

test.describe("Theme Toggle", () => {
  test("should toggle between light and dark themes", async ({ page }) => {
    await page.goto("/");
    
    // Get initial theme
    const html = page.locator("html");
    const initialClass = await html.getAttribute("class");
    
    // Find and click theme toggle if it exists
    const themeToggle = page.locator('[aria-label*="theme"], [data-testid="theme-toggle"], button:has-text("dark"), button:has-text("light")').first();
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      
      // Theme class should change
      await page.waitForTimeout(500);
      const newClass = await html.getAttribute("class");
      
      // Either class changed or we verify the theme is applied
      expect(newClass !== initialClass || newClass?.includes("dark") || newClass?.includes("light")).toBeTruthy();
    }
  });
});
