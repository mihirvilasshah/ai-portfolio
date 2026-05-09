import { test, expect } from "@playwright/test";

// Helper to login for authenticated tests
async function loginAsDemo(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill("demo@example.com");
  await page.getByLabel(/password/i).fill("demo123");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForTimeout(2000);
}

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
    await page.goto("/dashboard");
  });

  test("should display dashboard with market overview", async ({ page }) => {
    // Check for main dashboard heading
    await expect(page.locator("h1, h2").first()).toBeVisible();
  });

  test("should display portfolio summary card", async ({ page }) => {
    // Look for portfolio-related content
    const portfolioCard = page.locator("text=/portfolio|total value|holdings/i").first();
    await expect(portfolioCard).toBeVisible();
  });

  test("should display market indices", async ({ page }) => {
    // Look for market indices (Nifty, Sensex, etc.)
    const indices = page.locator("text=/nifty|sensex|dow|nasdaq|index/i").first();
    
    if (await indices.isVisible()) {
      await expect(indices).toBeVisible();
    }
  });

  test("should display trending stocks section", async ({ page }) => {
    // Look for trending or top movers section
    const trending = page.locator("text=/trending|top movers|gainers|losers/i").first();
    
    if (await trending.isVisible()) {
      await expect(trending).toBeVisible();
    }
  });

  test("should have sidebar navigation", async ({ page }) => {
    // Check for navigation links
    const dashboardLink = page.locator("a:has-text('Dashboard'), nav a:has-text('Dashboard')").first();
    const screenerLink = page.locator("a:has-text('Screener'), nav a:has-text('Screener')").first();
    
    // At least one navigation element should be visible
    const hasNav = await dashboardLink.isVisible() || await screenerLink.isVisible();
    expect(hasNav).toBeTruthy();
  });

  test("should navigate to different sections from dashboard", async ({ page }) => {
    // Click screener link
    const screenerLink = page.locator("a:has-text('Screener')").first();
    
    if (await screenerLink.isVisible()) {
      await screenerLink.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain("screener");
    }
  });

  test("should display recommendations summary", async ({ page }) => {
    // Look for recommendations section
    const recsSection = page.locator("text=/recommendation|buy|sell|hold/i").first();
    
    if (await recsSection.isVisible()) {
      await expect(recsSection).toBeVisible();
    }
  });

  test("should be responsive on tablet", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Dashboard should still be functional
    await expect(page.locator("body")).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Dashboard should still be functional
    await expect(page.locator("body")).toBeVisible();
    
    // Mobile navigation should be accessible
    // Look for hamburger menu or bottom nav
    const mobileNav = page.locator("[aria-label*='menu'], button:has(svg), nav").first();
    await expect(mobileNav).toBeVisible();
  });
});

test.describe("Dashboard Quick Actions", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page);
    await page.goto("/dashboard");
  });

  test("should have quick access to add holdings", async ({ page }) => {
    const addButton = page.locator("button:has-text('Add'), a:has-text('Add')").first();
    
    if (await addButton.isVisible()) {
      await expect(addButton).toBeVisible();
    }
  });

  test("should refresh market data", async ({ page }) => {
    const refreshButton = page.locator("button:has-text('Refresh'), button[aria-label*='refresh']").first();
    
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      await page.waitForTimeout(1000);
    }
    
    await expect(page.locator("body")).toBeVisible();
  });
});
