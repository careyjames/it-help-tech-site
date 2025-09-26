module.exports = {
  ci: {
    collect: {
      // Test key pages on both mobile and desktop
      url: [
        'http://localhost:8080/',           // Homepage
        'http://localhost:8080/services/',  // Services page
        'http://localhost:8080/billing/',   // Billing/pricing page
        'http://localhost:8080/about/',     // About page
        'http://localhost:8080/blog/',      // Blog index
      ],
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu --headless --disable-extensions --no-first-run --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding --disable-features=VizDisplayCompositor',
        preset: 'desktop', // Start with desktop, can add mobile later if this works
      },
    },
    assert: {
      // Balanced performance budgets - critical issues block PRs, others warn
      assertions: {
        // CRITICAL (block PR) - Core performance that affects user experience
        'categories:performance': ['error', {minScore: 0.90}],   // 90+ performance (raised from 85)
        'largest-contentful-paint': ['error', {maxNumericValue: 2500}], // LCP < 2.5s (stricter than Google's 3s)
        'cumulative-layout-shift': ['error', {maxNumericValue: 0.1}],   // CLS < 0.1 (tighter stability)
        'first-contentful-paint': ['error', {maxNumericValue: 1200}],   // FCP < 1.2s (critical render timing)

        // IMPORTANT (warn only) - Issues to track but don't block development
        'categories:accessibility': ['warn', {minScore: 0.95}],  // 95+ accessibility (new addition)
        'categories:best-practices': ['warn', {minScore: 0.95}], // 95+ best practices (raised from 90)
        'categories:seo': ['warn', {minScore: 0.95}],            // 95+ SEO (raised from 90)
        'total-blocking-time': ['warn', {maxNumericValue: 300}],        // TBT < 300ms (stricter)

        // RESOURCE BUDGETS (stricter enforcement) - Monitor resource efficiency
        'resource-summary:document:size': ['warn', {maxNumericValue: 60000}],   // HTML < 60KB (tighter)
        'resource-summary:stylesheet:size': ['warn', {maxNumericValue: 40000}], // CSS < 40KB (reduced from 50KB)
        'resource-summary:script:size': ['warn', {maxNumericValue: 12000}],     // JS < 12KB (reduced from 15KB)
        'resource-summary:stylesheet:count': ['warn', {maxNumericValue: 8}],    // Max 8 CSS files (reduced from 10)
        'resource-summary:script:count': ['warn', {maxNumericValue: 6}],        // Max 6 JS files (reduced from 8)
        'resource-summary:image:size': ['warn', {maxNumericValue: 200000}],     // Images < 200KB (new budget)
      },
    },
    upload: {
      // Store results for trend analysis (can be configured later)
      target: 'temporary-public-storage',
    },
  },
};