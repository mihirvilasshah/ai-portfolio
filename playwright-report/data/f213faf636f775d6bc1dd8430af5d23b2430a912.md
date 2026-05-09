# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Landing Page >> should display compliance disclaimer
- Location: e2e\navigation.spec.ts:53:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=/not financial advice|educational|disclaimer/i').first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=/not financial advice|educational|disclaimer/i').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - heading "AI Investment Platform" [level=1] [ref=e8]
      - paragraph [ref=e9]: Sign in to access your portfolio
    - generic [ref=e10]:
      - generic [ref=e11]:
        - heading "Sign In" [level=3] [ref=e12]
        - paragraph [ref=e13]: Enter your credentials to access your account
      - generic [ref=e14]:
        - button "Continue with Google" [ref=e15]:
          - img
          - text: Continue with Google
        - generic [ref=e20]: Or continue with email
        - generic [ref=e21]:
          - generic [ref=e22]:
            - text: Email
            - generic [ref=e23]:
              - img [ref=e25]
              - textbox "Email" [ref=e27]:
                - /placeholder: you@example.com
          - generic [ref=e28]:
            - text: Password
            - generic [ref=e29]:
              - img [ref=e31]
              - textbox "Password" [ref=e33]:
                - /placeholder: ••••••••
              - button [ref=e34]:
                - img [ref=e35]
          - generic [ref=e38]:
            - generic [ref=e39]:
              - checkbox "Remember me" [ref=e40]
              - generic [ref=e41]: Remember me
            - link "Forgot password?" [ref=e42] [cursor=pointer]:
              - /url: /forgot-password
          - button "Sign In" [ref=e43]
        - generic [ref=e44]:
          - paragraph [ref=e45]: "Demo Credentials:"
          - paragraph [ref=e46]: "Email: demo@example.com"
          - paragraph [ref=e47]: "Password: demo123"
    - paragraph [ref=e48]:
      - text: Don't have an account?
      - link "Sign up" [ref=e49] [cursor=pointer]:
        - /url: /register
    - paragraph [ref=e50]:
      - text: By signing in, you agree to our
      - link "Terms of Service" [ref=e51] [cursor=pointer]:
        - /url: /terms
      - text: and
      - link "Privacy Policy" [ref=e52] [cursor=pointer]:
        - /url: /privacy
  - button "Open Next.js Dev Tools" [ref=e58] [cursor=pointer]:
    - img [ref=e59]
  - alert [ref=e62]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Navigation", () => {
  4  |   test("should display landing page", async ({ page }) => {
  5  |     await page.goto("/");
  6  |     
  7  |     // Check for main heading
  8  |     await expect(page.locator("h1")).toBeVisible();
  9  |     
  10 |     // Check for main CTA buttons
  11 |     await expect(page.getByRole("link", { name: /get started/i })).toBeVisible();
  12 |   });
  13 | 
  14 |   test("should navigate to login page", async ({ page }) => {
  15 |     await page.goto("/");
  16 |     
  17 |     // Click login/sign in link
  18 |     await page.getByRole("link", { name: /sign in|login/i }).first().click();
  19 |     
  20 |     // Should be on login page
  21 |     await expect(page).toHaveURL(/.*login/);
  22 |     await expect(page.getByRole("heading", { name: /sign in|login/i })).toBeVisible();
  23 |   });
  24 | 
  25 |   test("should redirect unauthenticated users to login", async ({ page }) => {
  26 |     // Try to access dashboard directly
  27 |     await page.goto("/dashboard");
  28 |     
  29 |     // Should redirect to login
  30 |     await expect(page).toHaveURL(/.*login/);
  31 |   });
  32 | 
  33 |   test("should have responsive navigation on mobile", async ({ page }) => {
  34 |     // Set mobile viewport
  35 |     await page.setViewportSize({ width: 375, height: 667 });
  36 |     
  37 |     await page.goto("/");
  38 |     
  39 |     // Page should still be functional
  40 |     await expect(page.locator("body")).toBeVisible();
  41 |   });
  42 | });
  43 | 
  44 | test.describe("Landing Page", () => {
  45 |   test("should display features section", async ({ page }) => {
  46 |     await page.goto("/");
  47 |     
  48 |     // Look for features or key selling points
  49 |     const featuresSection = page.locator("text=/feature|insight|recommendation|portfolio/i").first();
  50 |     await expect(featuresSection).toBeVisible();
  51 |   });
  52 | 
  53 |   test("should display compliance disclaimer", async ({ page }) => {
  54 |     await page.goto("/");
  55 |     
  56 |     // Check for compliance/disclaimer text
  57 |     const disclaimer = page.locator("text=/not financial advice|educational|disclaimer/i").first();
> 58 |     await expect(disclaimer).toBeVisible();
     |                              ^ Error: expect(locator).toBeVisible() failed
  59 |   });
  60 | 
  61 |   test("should have proper meta tags for SEO", async ({ page }) => {
  62 |     await page.goto("/");
  63 |     
  64 |     // Check title
  65 |     await expect(page).toHaveTitle(/AI Portfolio/i);
  66 |     
  67 |     // Check meta description exists
  68 |     const metaDescription = page.locator('meta[name="description"]');
  69 |     await expect(metaDescription).toHaveAttribute("content", /.+/);
  70 |   });
  71 | });
  72 | 
  73 | test.describe("Theme Toggle", () => {
  74 |   test("should toggle between light and dark themes", async ({ page }) => {
  75 |     await page.goto("/");
  76 |     
  77 |     // Get initial theme
  78 |     const html = page.locator("html");
  79 |     const initialClass = await html.getAttribute("class");
  80 |     
  81 |     // Find and click theme toggle if it exists
  82 |     const themeToggle = page.locator('[aria-label*="theme"], [data-testid="theme-toggle"], button:has-text("dark"), button:has-text("light")').first();
  83 |     
  84 |     if (await themeToggle.isVisible()) {
  85 |       await themeToggle.click();
  86 |       
  87 |       // Theme class should change
  88 |       await page.waitForTimeout(500);
  89 |       const newClass = await html.getAttribute("class");
  90 |       
  91 |       // Either class changed or we verify the theme is applied
  92 |       expect(newClass !== initialClass || newClass?.includes("dark") || newClass?.includes("light")).toBeTruthy();
  93 |     }
  94 |   });
  95 | });
  96 | 
```