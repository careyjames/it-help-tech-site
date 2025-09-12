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
        'categories:performance': ['error', {minScore: 0.85}],   // 85+ performance (more realistic)
        'metrics:largest-contentful-paint': ['error', {maxNumericValue: 3000}], // LCP < 3s (Google's "Good" threshold)
        'metrics:cumulative-layout-shift': ['error', {maxNumericValue: 0.2}],   // CLS < 0.2 (reasonable stability)
        
        // IMPORTANT (warn only) - Issues to track but don't block development
        'categories:accessibility': ['warn', {minScore: 0.85}],  // 85+ accessibility
        'categories:best-practices': ['warn', {minScore: 0.90}], // 90+ best practices
        'categories:seo': ['warn', {minScore: 0.90}],            // 90+ SEO
        'metrics:first-contentful-paint': ['warn', {maxNumericValue: 1500}],    // FCP < 1.5s
        'metrics:total-blocking-time': ['warn', {maxNumericValue: 400}],        // TBT < 400ms
        
        // RESOURCE BUDGETS (warn only) - Monitor but don't block
        'resource-summary:document:size': ['warn', {maxNumericValue: 75000}],   // HTML < 75KB
        'resource-summary:stylesheet:size': ['warn', {maxNumericValue: 50000}], // CSS < 50KB
        'resource-summary:script:size': ['warn', {maxNumericValue: 15000}],     // JS < 15KB
        'resource-summary:stylesheet:count': ['warn', {maxNumericValue: 10}],
        'resource-summary:script:count': ['warn', {maxNumericValue: 8}],
      },
    },
    upload: {
      // Store results for trend analysis (can be configured later)
      target: 'temporary-public-storage',
    },
  },
};