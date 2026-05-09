# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: screener.spec.ts >> Screener Page >> should be responsive on mobile
- Location: e2e\screener.spec.ts:92:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByPlaceholder(/search/i)
Expected: visible
Error: strict mode violation: getByPlaceholder(/search/i) resolved to 2 elements:
    1) <input type="search" placeholder="Search assets, news..." class="w-full pl-10 pr-4 py-2 text-sm bg-muted rounded-lg border border-transparent focus:border-primary focus:outline-none"/> aka getByPlaceholder('Search assets, news...')
    2) <input value="" placeholder="Search by name or symbol..." class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"/> aka getByRole('textbox', { name: 'Search by name or symbol...' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByPlaceholder(/search/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - link "InvestAI" [ref=e5] [cursor=pointer]:
        - /url: /
        - img [ref=e7]
        - generic [ref=e9]: InvestAI
      - navigation [ref=e10]:
        - generic [ref=e11]:
          - link "Dashboard" [ref=e12] [cursor=pointer]:
            - /url: /dashboard
            - img [ref=e13]
            - generic [ref=e15]: Dashboard
          - link "Screener" [ref=e16] [cursor=pointer]:
            - /url: /screener
            - img [ref=e17]
            - generic [ref=e19]: Screener
          - link "Recommendations AI" [ref=e20] [cursor=pointer]:
            - /url: /recommendations
            - img [ref=e21]
            - generic [ref=e23]: Recommendations
            - generic [ref=e24]: AI
          - link "AI Insights Beta" [ref=e25] [cursor=pointer]:
            - /url: /insights
            - img [ref=e26]
            - generic [ref=e28]: AI Insights
            - generic [ref=e29]: Beta
          - link "Portfolio" [ref=e30] [cursor=pointer]:
            - /url: /portfolio
            - img [ref=e31]
            - generic [ref=e33]: Portfolio
          - link "Watchlist" [ref=e34] [cursor=pointer]:
            - /url: /watchlist
            - img [ref=e35]
            - generic [ref=e37]: Watchlist
          - link "Markets" [ref=e38] [cursor=pointer]:
            - /url: /markets
            - img [ref=e39]
            - generic [ref=e41]: Markets
          - link "News" [ref=e42] [cursor=pointer]:
            - /url: /news
            - img [ref=e43]
            - generic [ref=e45]: News
      - link "Settings" [ref=e47] [cursor=pointer]:
        - /url: /settings
        - img [ref=e48]
        - generic [ref=e51]: Settings
    - generic [ref=e52]:
      - banner [ref=e53]:
        - button [ref=e54]:
          - img
        - generic [ref=e55]:
          - button [ref=e56]:
            - img
          - button [ref=e57]:
            - img
          - button "U" [ref=e58]:
            - generic [ref=e59]: U
      - main [ref=e60]:
        - generic [ref=e61]:
          - generic [ref=e62]:
            - heading "Stock Screener" [level=1] [ref=e63]
            - paragraph [ref=e64]: Search and filter stocks across Indian and US markets
          - generic [ref=e67]:
            - generic [ref=e68]:
              - generic [ref=e69]:
                - img [ref=e71]
                - textbox "Search by name or symbol..." [ref=e73]
              - button "Filters" [ref=e74]:
                - img
                - text: Filters
            - generic [ref=e75]:
              - button "All Markets" [ref=e76]
              - button "NSE" [ref=e77]
              - button "BSE" [ref=e78]
              - button "US Stocks" [ref=e79]
              - button "Crypto" [ref=e80]
          - generic [ref=e81]: Showing 10 of 10 assets
          - table [ref=e84]:
            - rowgroup [ref=e85]:
              - row "Asset Price Change" [ref=e86]:
                - columnheader "Asset" [ref=e87]
                - columnheader "Price" [ref=e88]
                - columnheader "Change" [ref=e89]
                - columnheader [ref=e90]
            - rowgroup [ref=e91]:
              - row "NV NVDA NVIDIA Corporation $875.28 +4.21%" [ref=e92]:
                - cell "NV NVDA NVIDIA Corporation" [ref=e93]:
                  - link "NV NVDA NVIDIA Corporation" [ref=e94] [cursor=pointer]:
                    - /url: /asset/NVDA
                    - generic [ref=e95]: NV
                    - generic [ref=e96]:
                      - generic [ref=e97]: NVDA
                      - generic [ref=e98]: NVIDIA Corporation
                - cell "$875.28" [ref=e99]
                - cell "+4.21%" [ref=e100]:
                  - generic [ref=e101]: +4.21%
                - cell [ref=e102]:
                  - button [ref=e103]:
                    - img [ref=e104]
              - row "ET ETH Ethereum $3,456.78 +3.45%" [ref=e106]:
                - cell "ET ETH Ethereum" [ref=e107]:
                  - link "ET ETH Ethereum" [ref=e108] [cursor=pointer]:
                    - /url: /asset/ETH
                    - generic [ref=e109]: ET
                    - generic [ref=e110]:
                      - generic [ref=e111]: ETH
                      - generic [ref=e112]: Ethereum
                - cell "$3,456.78" [ref=e113]
                - cell "+3.45%" [ref=e114]:
                  - generic [ref=e115]: +3.45%
                - cell [ref=e116]:
                  - button [ref=e117]:
                    - img [ref=e118]
              - row "BT BTC Bitcoin $67,845.50 +2.87%" [ref=e120]:
                - cell "BT BTC Bitcoin" [ref=e121]:
                  - link "BT BTC Bitcoin" [ref=e122] [cursor=pointer]:
                    - /url: /asset/BTC
                    - generic [ref=e123]: BT
                    - generic [ref=e124]:
                      - generic [ref=e125]: BTC
                      - generic [ref=e126]: Bitcoin
                - cell "$67,845.50" [ref=e127]
                - cell "+2.87%" [ref=e128]:
                  - generic [ref=e129]: +2.87%
                - cell [ref=e130]:
                  - button [ref=e131]:
                    - img [ref=e132]
              - row "RE RELIANCE Reliance Industries ₹2,847.50 +2.34%" [ref=e134]:
                - cell "RE RELIANCE Reliance Industries" [ref=e135]:
                  - link "RE RELIANCE Reliance Industries" [ref=e136] [cursor=pointer]:
                    - /url: /asset/RELIANCE.NS
                    - generic [ref=e137]: RE
                    - generic [ref=e138]:
                      - generic [ref=e139]: RELIANCE
                      - generic [ref=e140]: Reliance Industries
                - cell "₹2,847.50" [ref=e141]
                - cell "+2.34%" [ref=e142]:
                  - generic [ref=e143]: +2.34%
                - cell [ref=e144]:
                  - button [ref=e145]:
                    - img [ref=e146]
              - row "AA AAPL Apple Inc. $189.45 +1.56%" [ref=e148]:
                - cell "AA AAPL Apple Inc." [ref=e149]:
                  - link "AA AAPL Apple Inc." [ref=e150] [cursor=pointer]:
                    - /url: /asset/AAPL
                    - generic [ref=e151]: AA
                    - generic [ref=e152]:
                      - generic [ref=e153]: AAPL
                      - generic [ref=e154]: Apple Inc.
                - cell "$189.45" [ref=e155]
                - cell "+1.56%" [ref=e156]:
                  - generic [ref=e157]: +1.56%
                - cell [ref=e158]:
                  - button [ref=e159]:
                    - img [ref=e160]
              - row "HD HDFCBANK HDFC Bank ₹1,623.40 +1.15%" [ref=e162]:
                - cell "HD HDFCBANK HDFC Bank" [ref=e163]:
                  - link "HD HDFCBANK HDFC Bank" [ref=e164] [cursor=pointer]:
                    - /url: /asset/HDFCBANK.NS
                    - generic [ref=e165]: HD
                    - generic [ref=e166]:
                      - generic [ref=e167]: HDFCBANK
                      - generic [ref=e168]: HDFC Bank
                - cell "₹1,623.40" [ref=e169]
                - cell "+1.15%" [ref=e170]:
                  - generic [ref=e171]: +1.15%
                - cell [ref=e172]:
                  - button [ref=e173]:
                    - img [ref=e174]
              - row "MS MSFT Microsoft Corporation $378.92 +0.92%" [ref=e176]:
                - cell "MS MSFT Microsoft Corporation" [ref=e177]:
                  - link "MS MSFT Microsoft Corporation" [ref=e178] [cursor=pointer]:
                    - /url: /asset/MSFT
                    - generic [ref=e179]: MS
                    - generic [ref=e180]:
                      - generic [ref=e181]: MSFT
                      - generic [ref=e182]: Microsoft Corporation
                - cell "$378.92" [ref=e183]
                - cell "+0.92%" [ref=e184]:
                  - generic [ref=e185]: +0.92%
                - cell [ref=e186]:
                  - button [ref=e187]:
                    - img [ref=e188]
              - row "IC ICICIBANK ICICI Bank ₹1,089.60 +0.78%" [ref=e190]:
                - cell "IC ICICIBANK ICICI Bank" [ref=e191]:
                  - link "IC ICICIBANK ICICI Bank" [ref=e192] [cursor=pointer]:
                    - /url: /asset/ICICIBANK.NS
                    - generic [ref=e193]: IC
                    - generic [ref=e194]:
                      - generic [ref=e195]: ICICIBANK
                      - generic [ref=e196]: ICICI Bank
                - cell "₹1,089.60" [ref=e197]
                - cell "+0.78%" [ref=e198]:
                  - generic [ref=e199]: +0.78%
                - cell [ref=e200]:
                  - button [ref=e201]:
                    - img [ref=e202]
              - row "TC TCS Tata Consultancy Services ₹3,456.75 -0.82%" [ref=e204]:
                - cell "TC TCS Tata Consultancy Services" [ref=e205]:
                  - link "TC TCS Tata Consultancy Services" [ref=e206] [cursor=pointer]:
                    - /url: /asset/TCS.NS
                    - generic [ref=e207]: TC
                    - generic [ref=e208]:
                      - generic [ref=e209]: TCS
                      - generic [ref=e210]: Tata Consultancy Services
                - cell "₹3,456.75" [ref=e211]
                - cell "-0.82%" [ref=e212]:
                  - generic [ref=e213]: "-0.82%"
                - cell [ref=e214]:
                  - button [ref=e215]:
                    - img [ref=e216]
              - row "IN INFY Infosys ₹1,478.25 -1.56%" [ref=e218]:
                - cell "IN INFY Infosys" [ref=e219]:
                  - link "IN INFY Infosys" [ref=e220] [cursor=pointer]:
                    - /url: /asset/INFY.NS
                    - generic [ref=e221]: IN
                    - generic [ref=e222]:
                      - generic [ref=e223]: INFY
                      - generic [ref=e224]: Infosys
                - cell "₹1,478.25" [ref=e225]
                - cell "-1.56%" [ref=e226]:
                  - generic [ref=e227]: "-1.56%"
                - cell [ref=e228]:
                  - button [ref=e229]:
                    - img [ref=e230]
  - button "Open Next.js Dev Tools" [ref=e237] [cursor=pointer]:
    - img [ref=e238]
  - alert [ref=e241]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | // Helper to login for authenticated tests
  4   | async function loginAsDemo(page: import("@playwright/test").Page) {
  5   |   await page.goto("/login");
  6   |   await page.getByLabel(/email/i).fill("demo@example.com");
  7   |   await page.getByLabel(/password/i).fill("demo123");
  8   |   await page.getByRole("button", { name: /sign in/i }).click();
  9   |   await page.waitForTimeout(2000);
  10  | }
  11  | 
  12  | test.describe("Screener Page", () => {
  13  |   test.beforeEach(async ({ page }) => {
  14  |     await loginAsDemo(page);
  15  |     await page.goto("/screener");
  16  |   });
  17  | 
  18  |   test("should display screener page with search", async ({ page }) => {
  19  |     // Check for search input
  20  |     const searchInput = page.getByPlaceholder(/search/i);
  21  |     await expect(searchInput).toBeVisible();
  22  |   });
  23  | 
  24  |   test("should display market filter chips", async ({ page }) => {
  25  |     // Check for market filter buttons
  26  |     await expect(page.locator("text=All Markets")).toBeVisible();
  27  |     await expect(page.locator("text=NSE")).toBeVisible();
  28  |     await expect(page.locator("text=Crypto")).toBeVisible();
  29  |   });
  30  | 
  31  |   test("should filter stocks by market", async ({ page }) => {
  32  |     // Click NSE filter
  33  |     await page.locator("button:has-text('NSE')").click();
  34  |     
  35  |     // Wait for filter to apply
  36  |     await page.waitForTimeout(500);
  37  |     
  38  |     // Should show filtered results (no specific assertion as data may vary)
  39  |     await expect(page.locator("body")).toBeVisible();
  40  |   });
  41  | 
  42  |   test("should search stocks by name", async ({ page }) => {
  43  |     const searchInput = page.getByPlaceholder(/search/i);
  44  |     
  45  |     // Type search query
  46  |     await searchInput.fill("Reliance");
  47  |     
  48  |     // Wait for search to filter
  49  |     await page.waitForTimeout(500);
  50  |     
  51  |     // Results should update based on search
  52  |     await expect(page.locator("body")).toBeVisible();
  53  |   });
  54  | 
  55  |   test("should toggle filters panel", async ({ page }) => {
  56  |     // Find filters button
  57  |     const filtersButton = page.locator("button:has-text('Filters')");
  58  |     
  59  |     if (await filtersButton.isVisible()) {
  60  |       await filtersButton.click();
  61  |       
  62  |       // Additional filters should appear
  63  |       await page.waitForTimeout(300);
  64  |     }
  65  |     
  66  |     await expect(page.locator("body")).toBeVisible();
  67  |   });
  68  | 
  69  |   test("should display stock table with columns", async ({ page }) => {
  70  |     // Look for table headers
  71  |     const table = page.locator("table, [role='table'], .table");
  72  |     
  73  |     if (await table.isVisible()) {
  74  |       // Check for common column headers
  75  |       const headers = page.locator("th, [role='columnheader']");
  76  |       expect(await headers.count()).toBeGreaterThan(0);
  77  |     }
  78  |   });
  79  | 
  80  |   test("should sort stocks", async ({ page }) => {
  81  |     // Find sort dropdown or button
  82  |     const sortControl = page.locator("select:has-text('Top'), button:has-text('Sort'), [aria-label*='sort']").first();
  83  |     
  84  |     if (await sortControl.isVisible()) {
  85  |       await sortControl.click();
  86  |       await page.waitForTimeout(300);
  87  |     }
  88  |     
  89  |     await expect(page.locator("body")).toBeVisible();
  90  |   });
  91  | 
  92  |   test("should be responsive on mobile", async ({ page }) => {
  93  |     await page.setViewportSize({ width: 375, height: 667 });
  94  |     
  95  |     // Page should still be functional
  96  |     const searchInput = page.getByPlaceholder(/search/i);
> 97  |     await expect(searchInput).toBeVisible();
      |                               ^ Error: expect(locator).toBeVisible() failed
  98  |   });
  99  | });
  100 | 
  101 | test.describe("Stock Table Interactions", () => {
  102 |   test.beforeEach(async ({ page }) => {
  103 |     await loginAsDemo(page);
  104 |     await page.goto("/screener");
  105 |   });
  106 | 
  107 |   test("should navigate to stock detail on row click", async ({ page }) => {
  108 |     // Find a clickable stock row
  109 |     const stockRow = page.locator("tr a, [data-testid='stock-row'], a:has-text('.NS'), a:has-text('AAPL')").first();
  110 |     
  111 |     if (await stockRow.isVisible()) {
  112 |       await stockRow.click();
  113 |       
  114 |       // Should navigate to asset detail page
  115 |       await page.waitForTimeout(1000);
  116 |       const url = page.url();
  117 |       expect(url.includes("asset") || url.includes("screener")).toBeTruthy();
  118 |     }
  119 |   });
  120 | 
  121 |   test("should toggle watchlist for a stock", async ({ page }) => {
  122 |     // Find watchlist toggle button (star icon)
  123 |     const watchlistButton = page.locator("button:has(svg), [aria-label*='watchlist']").first();
  124 |     
  125 |     if (await watchlistButton.isVisible()) {
  126 |       await watchlistButton.click();
  127 |       await page.waitForTimeout(300);
  128 |     }
  129 |     
  130 |     await expect(page.locator("body")).toBeVisible();
  131 |   });
  132 | });
  133 | 
```