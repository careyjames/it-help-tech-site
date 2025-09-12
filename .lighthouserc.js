module.exports = {
  ci: {
    collect: {
      // Test key pages
      url: [
        'http://localhost:8080/',           // Homepage
        'http://localhost:8080/services/',  // Services page
        'http://localhost:8080/billing/',   // Billing/pricing page
        'http://localhost:8080/about/',     // About page
        'http://localhost:8080/blog/',      // Blog index
      ],
      settings: {
        // Use mobile simulation for primary testing
        preset: 'desktop', // Test desktop first, can add mobile later
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
      },
    },
    assert: {
      // Performance budgets - realistic targets for initial implementation
      assertions: {
        'categories:performance': ['error', {minScore: 0.90}],   // 90+ performance  
        'categories:accessibility': ['error', {minScore: 0.90}], // 90+ accessibility
        'categories:best-practices': ['error', {minScore: 0.95}], // 95+ best practices
        'categories:seo': ['error', {minScore: 0.95}],           // 95+ SEO
        
        // Core Web Vitals - realistic targets
        'metrics:largest-contentful-paint': ['error', {maxNumericValue: 2500}], // LCP < 2.5s
        'metrics:first-contentful-paint': ['error', {maxNumericValue: 1200}],   // FCP < 1.2s
        'metrics:cumulative-layout-shift': ['error', {maxNumericValue: 0.1}],   // CLS < 0.1
        'metrics:total-blocking-time': ['error', {maxNumericValue: 300}],       // TBT < 300ms
        
        // Resource budgets - more generous initially
        'resource-summary:document:size': ['error', {maxNumericValue: 75000}],   // HTML < 75KB
        'resource-summary:stylesheet:size': ['error', {maxNumericValue: 50000}], // CSS < 50KB
        'resource-summary:script:size': ['error', {maxNumericValue: 15000}],     // JS < 15KB
        
        // Network requests - focus on key metrics only
        'resource-summary:stylesheet:count': ['error', {maxNumericValue: 10}],
        'resource-summary:script:count': ['error', {maxNumericValue: 8}],
      },
    },
    upload: {
      // Store results for trend analysis (can be configured later)
      target: 'temporary-public-storage',
    },
  },
};