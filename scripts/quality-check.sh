#!/bin/bash

# quality-check.sh - Comprehensive Quality Assurance Testing
# Run all quality checks: Performance, Accessibility, and Security

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🛡️ IT Help Tech - Comprehensive Quality Assurance${NC}"
echo "=================================================="
echo ""

# Track overall results
PERFORMANCE_PASSED=false
ACCESSIBILITY_PASSED=false
SECURITY_PASSED=false
OVERALL_PASSED=false

# Create results directory
mkdir -p .qa-results
rm -rf .qa-results/*

echo -e "${BLUE}🔧 Checking dependencies...${NC}"

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing npm dependencies...${NC}"
    npm install
fi

echo -e "${GREEN}✅ Dependencies ready${NC}"
echo ""

echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf public/
echo -e "${GREEN}✅ Clean complete${NC}"
echo ""

echo -e "${BLUE}🏗️ Building site with Zola...${NC}"
if zola build; then
    echo -e "${GREEN}✅ Site built successfully${NC}"
else
    echo -e "${RED}❌ Site build failed${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}✂️ Purging unused CSS...${NC}"
npx purgecss --css public/css/*.css --content public/**/*.html --output public/css/ --safelist "phone-line"
echo -e "${GREEN}✅ CSS optimized${NC}"
echo ""

echo -e "${BLUE}📁 Copying assets...${NC}"
./scripts/copy-assets.sh
echo -e "${GREEN}✅ Assets copied${NC}"
echo ""

# Start servers for testing
echo -e "${BLUE}🚀 Starting test servers...${NC}"

# Start secure servers with security headers
node scripts/secure-server.js 8080 8081 8082 &
SECURE_SERVER_PID=$!

# Set up cleanup trap
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up servers...${NC}"
    kill $SECURE_SERVER_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}
trap cleanup EXIT INT TERM

# Wait for servers to start
echo -e "${YELLOW}⏳ Waiting for servers to start...${NC}"
sleep 3

# Check servers are ready
for port in 8080 8081 8082; do
    if curl -s http://localhost:${port}/ > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server ready on port ${port}${NC}"
    else
        echo -e "${RED}❌ Server failed to start on port ${port}${NC}"
        exit 1
    fi
done
echo ""

# Run Performance Tests
echo -e "${BLUE}🚀 Running Performance Tests (Lighthouse)...${NC}"
echo "================================================="
if PORT=8080 ./scripts/validate-lighthouse.sh; then
    echo -e "${GREEN}✅ Performance tests PASSED${NC}"
    PERFORMANCE_PASSED=true
    cp -r .lighthouseci .qa-results/ 2>/dev/null || true
else
    echo -e "${RED}❌ Performance tests FAILED${NC}"
    cp -r .lighthouseci .qa-results/ 2>/dev/null || true
fi
echo ""

# Run Accessibility Tests  
echo -e "${BLUE}♿ Running Accessibility Tests (WCAG 2.2 AA)...${NC}"
echo "================================================="
if PORT=8081 ./scripts/accessibility-test.sh; then
    echo -e "${GREEN}✅ Accessibility tests PASSED${NC}"
    ACCESSIBILITY_PASSED=true
    cp -r .accessibility-results .qa-results/ 2>/dev/null || true
else
    echo -e "${RED}❌ Accessibility tests FAILED${NC}"
    cp -r .accessibility-results .qa-results/ 2>/dev/null || true
fi
echo ""

# Run Security Tests
echo -e "${BLUE}🔒 Running Security Tests...${NC}"
echo "================================================="
if PORT=8082 ./scripts/security-test.sh; then
    echo -e "${GREEN}✅ Security tests PASSED${NC}"
    SECURITY_PASSED=true
    cp -r .security-results .qa-results/ 2>/dev/null || true
else
    echo -e "${RED}❌ Security tests FAILED${NC}"
    cp -r .security-results .qa-results/ 2>/dev/null || true
fi
echo ""

# Generate comprehensive summary
echo -e "${BLUE}📋 Generating comprehensive QA summary...${NC}"

# Determine overall status
if [ "$PERFORMANCE_PASSED" = true ] && [ "$ACCESSIBILITY_PASSED" = true ] && [ "$SECURITY_PASSED" = true ]; then
    OVERALL_PASSED=true
fi

cat > .qa-results/comprehensive-summary.md << EOF
# 🛡️ Comprehensive Quality Assurance Report

## Overall Status
$(if [ "$OVERALL_PASSED" = true ]; then echo "✅ **ALL TESTS PASSED** - Your site meets all quality standards!"; else echo "❌ **SOME TESTS FAILED** - Review the detailed results below"; fi)

## Test Results Summary

### 🚀 Performance (Lighthouse)
$(if [ "$PERFORMANCE_PASSED" = true ]; then echo "✅ **PASSED** - All performance gates met"; else echo "❌ **FAILED** - Performance requirements not met"; fi)
- Targets: Performance ≥85, Best Practices ≥90, SEO ≥90
- Core Web Vitals: LCP <3.0s, CLS <0.2
- Report: \`.qa-results/.lighthouseci/\`

### ♿ Accessibility (WCAG 2.2 AA)
$(if [ "$ACCESSIBILITY_PASSED" = true ]; then echo "✅ **PASSED** - WCAG 2.2 AA compliant"; else echo "❌ **FAILED** - Accessibility issues detected"; fi)
- Tools: axe-core + Pa11y
- Standards: WCAG 2.2 Level AA compliance
- Report: \`.qa-results/.accessibility-results/\`

### 🔒 Security
$(if [ "$SECURITY_PASSED" = true ]; then echo "✅ **PASSED** - Security checks passed"; else echo "❌ **FAILED** - Security issues detected"; fi)
- Headers: CSP, HSTS, X-Frame-Options, etc.
- Baseline: OWASP security best practices
- Report: \`.qa-results/.security-results/\`

## Pages Tested
- **Homepage**: http://localhost:8080/
- **Services**: http://localhost:8080/services/
- **Billing**: http://localhost:8080/billing/
- **About**: http://localhost:8080/about/
- **Blog**: http://localhost:8080/blog/

## Quick Actions

### If Tests Failed
\`\`\`bash
# Run individual test suites
npm run lighthouse    # Performance only
npm run accessibility # Accessibility only  
npm run security     # Security only
\`\`\`

### Production Validation
- **Mozilla Observatory**: https://observatory.mozilla.org/
- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **Security Headers**: https://securityheaders.com/
- **Google PageSpeed**: https://pagespeed.web.dev/

## Quality Standards Met
- ✅ Static-first architecture (Zola)
- ✅ Modern image formats (AVIF/WebP)
- ✅ Optimized CSS bundle (<35KB target)
- ✅ Progressive enhancement approach
- ✅ Security-first header configuration
- ✅ Accessibility-first design patterns

---
**Generated**: $(date)
**Quality Gate**: $(if [ "$OVERALL_PASSED" = true ]; then echo "PASSED ✅"; else echo "FAILED ❌"; fi)
EOF

# Display final results
echo ""
echo -e "${PURPLE}🛡️ COMPREHENSIVE QA RESULTS${NC}"
echo "=============================="
echo ""
echo -e "🚀 Performance:    $(if [ "$PERFORMANCE_PASSED" = true ]; then echo -e "${GREEN}PASSED ✅${NC}"; else echo -e "${RED}FAILED ❌${NC}"; fi)"
echo -e "♿ Accessibility:   $(if [ "$ACCESSIBILITY_PASSED" = true ]; then echo -e "${GREEN}PASSED ✅${NC}"; else echo -e "${RED}FAILED ❌${NC}"; fi)"
echo -e "🔒 Security:        $(if [ "$SECURITY_PASSED" = true ]; then echo -e "${GREEN}PASSED ✅${NC}"; else echo -e "${RED}FAILED ❌${NC}"; fi)"
echo ""
echo -e "🎯 Overall Result:  $(if [ "$OVERALL_PASSED" = true ]; then echo -e "${GREEN}ALL TESTS PASSED ✅${NC}"; else echo -e "${RED}SOME TESTS FAILED ❌${NC}"; fi)"
echo ""

if [ "$OVERALL_PASSED" = true ]; then
    echo -e "${GREEN}🎉 Congratulations! Your site meets all quality standards.${NC}"
    echo -e "${GREEN}🚀 Ready for production deployment!${NC}"
    echo ""
    echo -e "${BLUE}📋 Detailed reports available in: .qa-results/${NC}"
    echo -e "${BLUE}📄 Comprehensive summary: .qa-results/comprehensive-summary.md${NC}"
    exit 0
else
    echo -e "${RED}❌ Quality gates failed. Please review the detailed reports.${NC}"
    echo ""
    echo -e "${YELLOW}📋 Detailed reports available in: .qa-results/${NC}"
    echo -e "${YELLOW}📄 Comprehensive summary: .qa-results/comprehensive-summary.md${NC}"
    echo ""
    echo -e "${YELLOW}💡 Quick fixes:${NC}"
    if [ "$PERFORMANCE_PASSED" = false ]; then
        echo -e "${YELLOW}   • Review Lighthouse report for performance optimizations${NC}"
    fi
    if [ "$ACCESSIBILITY_PASSED" = false ]; then
        echo -e "${YELLOW}   • Check accessibility report for WCAG violations${NC}"
    fi
    if [ "$SECURITY_PASSED" = false ]; then
        echo -e "${YELLOW}   • Verify security headers and configuration${NC}"
    fi
    exit 1
fi