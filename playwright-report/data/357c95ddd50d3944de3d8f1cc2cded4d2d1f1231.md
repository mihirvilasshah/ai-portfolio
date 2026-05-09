# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: screener.spec.ts >> Screener Page >> should search stocks by name
- Location: e2e\screener.spec.ts:42:7

# Error details

```
Error: locator.fill: Error: strict mode violation: getByPlaceholder(/search/i) resolved to 2 elements:
    1) <input type="search" placeholder="Search assets, news..." class="w-full pl-10 pr-4 py-2 text-sm bg-muted rounded-lg border border-transparent focus:border-primary focus:outline-none"/> aka getByRole('searchbox', { name: 'Search assets, news...' })
    2) <input value="" placeholder="Search by name or symbol..." class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"/> aka getByRole('textbox', { name: 'Search by name or symbol...' })

Call log:
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
      - generic [ref=e46]:
        - link "Settings" [ref=e47] [cursor=pointer]:
          - /url: /settings
          - img [ref=e48]
          - generic [ref=e51]: Settings
        - button [ref=e52]:
          - img [ref=e53]
    - generic [ref=e55]:
      - banner [ref=e56]:
        - generic [ref=e58]:
          - img [ref=e60]
          - searchbox "Search assets, news..." [ref=e62]
        - generic [ref=e63]:
          - button [ref=e64]:
            - img
          - button "U User" [ref=e65]:
            - generic [ref=e66]: U
            - generic [ref=e67]: User
      - main [ref=e68]:
        - generic [ref=e69]:
          - generic [ref=e70]:
            - heading "Stock Screener" [level=1] [ref=e71]
            - paragraph [ref=e72]: Search and filter stocks across Indian and US markets
          - generic [ref=e75]:
            - generic [ref=e76]:
              - generic [ref=e77]:
                - img [ref=e79]
                - textbox "Search by name or symbol..." [ref=e81]
              - button "Filters" [ref=e82]:
                - img
                - text: Filters
            - generic [ref=e83]:
              - button "All Markets" [ref=e84]
              - button "NSE" [ref=e85]
              - button "BSE" [ref=e86]
              - button "US Stocks" [ref=e87]
              - button "Crypto" [ref=e88]
          - generic [ref=e89]: Showing 10 of 10 assets
          - table [ref=e92]:
            - rowgroup [ref=e93]:
              - row "Asset Price Change Volume Market Cap P/E" [ref=e94]:
                - columnheader "Asset" [ref=e95]
                - columnheader "Price" [ref=e96]
                - columnheader "Change" [ref=e97]
                - columnheader "Volume" [ref=e98]
                - columnheader "Market Cap" [ref=e99]
                - columnheader "P/E" [ref=e100]
                - columnheader [ref=e101]
            - rowgroup [ref=e102]:
              - row "NV NVDA NVIDIA Corporation $875.28 +4.21% 32.1M $2.15T 68.5" [ref=e103]:
                - cell "NV NVDA NVIDIA Corporation" [ref=e104]:
                  - link "NV NVDA NVIDIA Corporation" [ref=e105] [cursor=pointer]:
                    - /url: /asset/NVDA
                    - generic [ref=e106]: NV
                    - generic [ref=e107]:
                      - generic [ref=e108]: NVDA
                      - generic [ref=e109]: NVIDIA Corporation
                - cell "$875.28" [ref=e110]
                - cell "+4.21%" [ref=e111]:
                  - generic [ref=e112]: +4.21%
                - cell "32.1M" [ref=e113]
                - cell "$2.15T" [ref=e114]:
                  - generic [ref=e115]: $2.15T
                - cell "68.5" [ref=e116]
                - cell [ref=e117]:
                  - button [ref=e118]:
                    - img [ref=e119]
              - row "ET ETH Ethereum $3,456.78 +3.45% $12.8B $415.00B N/A" [ref=e121]:
                - cell "ET ETH Ethereum" [ref=e122]:
                  - link "ET ETH Ethereum" [ref=e123] [cursor=pointer]:
                    - /url: /asset/ETH
                    - generic [ref=e124]: ET
                    - generic [ref=e125]:
                      - generic [ref=e126]: ETH
                      - generic [ref=e127]: Ethereum
                - cell "$3,456.78" [ref=e128]
                - cell "+3.45%" [ref=e129]:
                  - generic [ref=e130]: +3.45%
                - cell "$12.8B" [ref=e131]
                - cell "$415.00B" [ref=e132]:
                  - generic [ref=e133]: $415.00B
                - cell "N/A" [ref=e134]
                - cell [ref=e135]:
                  - button [ref=e136]:
                    - img [ref=e137]
              - row "BT BTC Bitcoin $67,845.50 +2.87% $28.5B $1.32T N/A" [ref=e139]:
                - cell "BT BTC Bitcoin" [ref=e140]:
                  - link "BT BTC Bitcoin" [ref=e141] [cursor=pointer]:
                    - /url: /asset/BTC
                    - generic [ref=e142]: BT
                    - generic [ref=e143]:
                      - generic [ref=e144]: BTC
                      - generic [ref=e145]: Bitcoin
                - cell "$67,845.50" [ref=e146]
                - cell "+2.87%" [ref=e147]:
                  - generic [ref=e148]: +2.87%
                - cell "$28.5B" [ref=e149]
                - cell "$1.32T" [ref=e150]:
                  - generic [ref=e151]: $1.32T
                - cell "N/A" [ref=e152]
                - cell [ref=e153]:
                  - button [ref=e154]:
                    - img [ref=e155]
              - row "RE RELIANCE Reliance Industries ₹2,847.50 +2.34% 12.5M ₹19.50T 28.5" [ref=e157]:
                - cell "RE RELIANCE Reliance Industries" [ref=e158]:
                  - link "RE RELIANCE Reliance Industries" [ref=e159] [cursor=pointer]:
                    - /url: /asset/RELIANCE.NS
                    - generic [ref=e160]: RE
                    - generic [ref=e161]:
                      - generic [ref=e162]: RELIANCE
                      - generic [ref=e163]: Reliance Industries
                - cell "₹2,847.50" [ref=e164]
                - cell "+2.34%" [ref=e165]:
                  - generic [ref=e166]: +2.34%
                - cell "12.5M" [ref=e167]
                - cell "₹19.50T" [ref=e168]:
                  - generic [ref=e169]: ₹19.50T
                - cell "28.5" [ref=e170]
                - cell [ref=e171]:
                  - button [ref=e172]:
                    - img [ref=e173]
              - row "AA AAPL Apple Inc. $189.45 +1.56% 45.2M $2.95T 29.8" [ref=e175]:
                - cell "AA AAPL Apple Inc." [ref=e176]:
                  - link "AA AAPL Apple Inc." [ref=e177] [cursor=pointer]:
                    - /url: /asset/AAPL
                    - generic [ref=e178]: AA
                    - generic [ref=e179]:
                      - generic [ref=e180]: AAPL
                      - generic [ref=e181]: Apple Inc.
                - cell "$189.45" [ref=e182]
                - cell "+1.56%" [ref=e183]:
                  - generic [ref=e184]: +1.56%
                - cell "45.2M" [ref=e185]
                - cell "$2.95T" [ref=e186]:
                  - generic [ref=e187]: $2.95T
                - cell "29.8" [ref=e188]
                - cell [ref=e189]:
                  - button [ref=e190]:
                    - img [ref=e191]
              - row "HD HDFCBANK HDFC Bank ₹1,623.40 +1.15% 9.8M ₹8.90T 21.8" [ref=e193]:
                - cell "HD HDFCBANK HDFC Bank" [ref=e194]:
                  - link "HD HDFCBANK HDFC Bank" [ref=e195] [cursor=pointer]:
                    - /url: /asset/HDFCBANK.NS
                    - generic [ref=e196]: HD
                    - generic [ref=e197]:
                      - generic [ref=e198]: HDFCBANK
                      - generic [ref=e199]: HDFC Bank
                - cell "₹1,623.40" [ref=e200]
                - cell "+1.15%" [ref=e201]:
                  - generic [ref=e202]: +1.15%
                - cell "9.8M" [ref=e203]
                - cell "₹8.90T" [ref=e204]:
                  - generic [ref=e205]: ₹8.90T
                - cell "21.8" [ref=e206]
                - cell [ref=e207]:
                  - button [ref=e208]:
                    - img [ref=e209]
              - row "MS MSFT Microsoft Corporation $378.92 +0.92% 22.1M $2.81T 35.2" [ref=e211]:
                - cell "MS MSFT Microsoft Corporation" [ref=e212]:
                  - link "MS MSFT Microsoft Corporation" [ref=e213] [cursor=pointer]:
                    - /url: /asset/MSFT
                    - generic [ref=e214]: MS
                    - generic [ref=e215]:
                      - generic [ref=e216]: MSFT
                      - generic [ref=e217]: Microsoft Corporation
                - cell "$378.92" [ref=e218]
                - cell "+0.92%" [ref=e219]:
                  - generic [ref=e220]: +0.92%
                - cell "22.1M" [ref=e221]
                - cell "$2.81T" [ref=e222]:
                  - generic [ref=e223]: $2.81T
                - cell "35.2" [ref=e224]
                - cell [ref=e225]:
                  - button [ref=e226]:
                    - img [ref=e227]
              - row "IC ICICIBANK ICICI Bank ₹1,089.60 +0.78% 11.2M ₹7.60T 18.5" [ref=e229]:
                - cell "IC ICICIBANK ICICI Bank" [ref=e230]:
                  - link "IC ICICIBANK ICICI Bank" [ref=e231] [cursor=pointer]:
                    - /url: /asset/ICICIBANK.NS
                    - generic [ref=e232]: IC
                    - generic [ref=e233]:
                      - generic [ref=e234]: ICICIBANK
                      - generic [ref=e235]: ICICI Bank
                - cell "₹1,089.60" [ref=e236]
                - cell "+0.78%" [ref=e237]:
                  - generic [ref=e238]: +0.78%
                - cell "11.2M" [ref=e239]
                - cell "₹7.60T" [ref=e240]:
                  - generic [ref=e241]: ₹7.60T
                - cell "18.5" [ref=e242]
                - cell [ref=e243]:
                  - button [ref=e244]:
                    - img [ref=e245]
              - row "TC TCS Tata Consultancy Services ₹3,456.75 -0.82% 8.2M ₹12.60T 32.4" [ref=e247]:
                - cell "TC TCS Tata Consultancy Services" [ref=e248]:
                  - link "TC TCS Tata Consultancy Services" [ref=e249] [cursor=pointer]:
                    - /url: /asset/TCS.NS
                    - generic [ref=e250]: TC
                    - generic [ref=e251]:
                      - generic [ref=e252]: TCS
                      - generic [ref=e253]: Tata Consultancy Services
                - cell "₹3,456.75" [ref=e254]
                - cell "-0.82%" [ref=e255]:
                  - generic [ref=e256]: "-0.82%"
                - cell "8.2M" [ref=e257]
                - cell "₹12.60T" [ref=e258]:
                  - generic [ref=e259]: ₹12.60T
                - cell "32.4" [ref=e260]
                - cell [ref=e261]:
                  - button [ref=e262]:
                    - img [ref=e263]
              - row "IN INFY Infosys ₹1,478.25 -1.56% 6.5M ₹6.10T 26.2" [ref=e265]:
                - cell "IN INFY Infosys" [ref=e266]:
                  - link "IN INFY Infosys" [ref=e267] [cursor=pointer]:
                    - /url: /asset/INFY.NS
                    - generic [ref=e268]: IN
                    - generic [ref=e269]:
                      - generic [ref=e270]: INFY
                      - generic [ref=e271]: Infosys
                - cell "₹1,478.25" [ref=e272]
                - cell "-1.56%" [ref=e273]:
                  - generic [ref=e274]: "-1.56%"
                - cell "6.5M" [ref=e275]
                - cell "₹6.10T" [ref=e276]:
                  - generic [ref=e277]: ₹6.10T
                - cell "26.2" [ref=e278]
                - cell [ref=e279]:
                  - button [ref=e280]:
                    - img [ref=e281]
  - button "Open Next.js Dev Tools" [ref=e288] [cursor=pointer]:
    - img [ref=e289]
  - alert [ref=e292]
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
> 46  |     await searchInput.fill("Reliance");
      |                       ^ Error: locator.fill: Error: strict mode violation: getByPlaceholder(/search/i) resolved to 2 elements:
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
  97  |     await expect(searchInput).toBeVisible();
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