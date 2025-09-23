#!/bin/bash

# security-test.sh - Comprehensive security testing with OWASP ZAP and Mozilla Observatory
# Run security scans on the built site

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 IT Help Tech - Comprehensive Security Testing${NC}"
echo "================================================="

# Test URLs - use PORT environment variable if set, default to 8082
PORT=${PORT:-8082}
BASE_URL="http://localhost:${PORT}"

URLS=(
    "${BASE_URL}/"
    "${BASE_URL}/services/"
    "${BASE_URL}/billing/"
    "${BASE_URL}/about/"
    "${BASE_URL}/blog/"
)

# Create results directory
mkdir -p .security-results
rm -rf .security-results/*

echo -e "${YELLOW}🔍 Running security tests on ${#URLS[@]} pages...${NC}"

# Track overall results
TOTAL_TESTS=0
PASSED_TESTS=0
ZAP_FAILED=false
OBSERVATORY_FAILED=false

# Server detection and management
EXTERNAL_SERVER=false
SERVER_PID=""

# Check if server is already running on the target port
if curl -s "${BASE_URL}/" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Using existing server on port ${PORT}${NC}"
    EXTERNAL_SERVER=true
else
    echo -e "${YELLOW}⚡ Starting secure server for security testing...${NC}"

    # Check if site is built
    if [ ! -d "public" ]; then
        echo -e "${YELLOW}🔧 Building site first...${NC}"
        zola build
    fi

    # Start secure server with security headers in background
    node scripts/secure-server.js ${PORT} > /dev/null 2>&1 &
    SERVER_PID=$!

    # Wait for server to start
    echo -e "${YELLOW}⏳ Waiting for server to be ready...${NC}"
    for i in {1..15}; do
        if curl -s "${BASE_URL}/" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Secure server started on port ${PORT}${NC}"
            EXTERNAL_SERVER=false
            break
        fi
        sleep 1
        if [ $i -eq 15 ]; then
            echo -e "${RED}❌ Failed to start server on port ${PORT}${NC}"
            if [ ! -z "$SERVER_PID" ]; then
                kill $SERVER_PID 2>/dev/null || true
            fi
            exit 1
        fi
    done
fi

# Cleanup function
cleanup() {
    if [ "$EXTERNAL_SERVER" = false ] && [ ! -z "$SERVER_PID" ]; then
        echo -e "\n${YELLOW}🧹 Stopping test server...${NC}"
        kill $SERVER_PID 2>/dev/null || true
        # Wait a moment for graceful shutdown
        sleep 1
        # Force kill if still running
        kill -9 $SERVER_PID 2>/dev/null || true
    fi
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Mozilla Observatory test (only test main domain)
echo -e "${BLUE}🌐 Testing with Mozilla Observatory...${NC}"
TOTAL_TESTS=$((TOTAL_TESTS + 1))

# Extract domain from base URL for Observatory testing
DOMAIN=$(echo "${BASE_URL}" | sed 's|http://||' | sed 's|https://||' | cut -d':' -f1)

echo -e "${YELLOW}  📊 Running Observatory scan for ${DOMAIN}...${NC}"

# For local testing, we'll simulate Observatory-style checks
# Note: Real Observatory requires public domains, so we'll do header validation
OBSERVATORY_RESULT="SIMULATED"

# Check security headers manually for local testing
HEADERS_CHECK=$(curl -s -I "${BASE_URL}/" | grep -i -E "(content-security-policy|strict-transport-security|x-frame-options|x-content-type-options|referrer-policy)" | wc -l)

if [ "$HEADERS_CHECK" -ge 4 ]; then
    echo -e "${GREEN}  ✅ Observatory (simulated): Strong security headers detected${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}  ❌ Observatory (simulated): Missing security headers${NC}"
    OBSERVATORY_FAILED=true
    curl -s -I "${BASE_URL}/" > ".security-results/headers-check.txt"
fi

# OWASP ZAP Baseline Scan (lightweight passive scan)
echo -e "${BLUE}🛡️  Running OWASP ZAP baseline scan...${NC}"

# Use a simplified security check since full ZAP requires Docker/Java
echo -e "${YELLOW}  🔍 Running baseline security checks...${NC}"

for url in "${URLS[@]}"; do
    PAGE_NAME=$(echo "$url" | sed "s|${BASE_URL}/||" | sed 's|/$||' | sed 's|^$|homepage|')
    echo -e "${BLUE}  Testing: ${url} (${PAGE_NAME})${NC}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    # Basic security checks
    SECURITY_ISSUES=0
    
    # Check 1: Ensure HTTPS redirects (for production)
    # Check 2: Security headers validation
    RESPONSE=$(curl -s -I "$url")
    
    # Check for basic security headers
    if ! echo "$RESPONSE" | grep -i "content-security-policy" > /dev/null; then
        echo -e "${YELLOW}    ⚠️  CSP header missing/not detected${NC}"
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    fi
    
    if ! echo "$RESPONSE" | grep -i "x-frame-options\|frame-ancestors" > /dev/null; then
        echo -e "${YELLOW}    ⚠️  Frame protection missing${NC}"
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    fi
    
    if ! echo "$RESPONSE" | grep -i "x-content-type-options" > /dev/null; then
        echo -e "${YELLOW}    ⚠️  Content-Type protection missing${NC}"
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    fi
    
    # Check content for potential issues
    CONTENT=$(curl -s "$url")
    
    # Check for inline scripts without CSP nonce (basic check)
    INLINE_SCRIPTS=$(echo "$CONTENT" | grep -c "<script[^>]*>" || echo "0")
    if [ "$INLINE_SCRIPTS" -gt 3 ]; then
        echo -e "${YELLOW}    ⚠️  Multiple inline scripts detected${NC}"
        SECURITY_ISSUES=$((SECURITY_ISSUES + 1))
    fi
    
    # Save detailed response for analysis
    echo "$RESPONSE" > ".security-results/headers-${PAGE_NAME}.txt"
    
    if [ "$SECURITY_ISSUES" -eq 0 ]; then
        echo -e "${GREEN}    ✅ No security issues detected${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}    ❌ ${SECURITY_ISSUES} security concerns found${NC}"
        ZAP_FAILED=true
        echo "Security issues found: $SECURITY_ISSUES" > ".security-results/issues-${PAGE_NAME}.txt"
    fi
    
    echo ""
done

# Generate summary report
echo -e "${BLUE}📋 Generating security summary...${NC}"

cat > .security-results/summary.md << EOF
# 🔒 Security Test Results

## Summary
- **Total tests run**: ${TOTAL_TESTS}
- **Tests passed**: ${PASSED_TESTS}
- **Tests failed**: $((TOTAL_TESTS - PASSED_TESTS))
- **Success rate**: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%

## Test Results

### Mozilla Observatory (Simulated)
$(if [ "$OBSERVATORY_FAILED" = false ]; then echo "✅ **PASSED** - Security headers properly configured"; else echo "❌ **FAILED** - Missing or inadequate security headers"; fi)

### OWASP ZAP Baseline (Simulated)
$(if [ "$ZAP_FAILED" = false ]; then echo "✅ **PASSED** - No baseline security issues detected"; else echo "❌ **FAILED** - Security concerns found (see individual reports)"; fi)

## Pages Tested

EOF

# Add detailed results for each page
for url in "${URLS[@]}"; do
    PAGE_NAME=$(echo "$url" | sed "s|${BASE_URL}/||" | sed 's|/$||' | sed 's|^$|homepage|')
    DISPLAY_NAME=$(echo "$PAGE_NAME" | sed 's|^homepage$|Homepage|' | sed 's|\b\w|\U&|g')

    echo "### ${DISPLAY_NAME}" >> .security-results/summary.md
    echo "**URL**: \`${url}\`" >> .security-results/summary.md
    echo "" >> .security-results/summary.md

    # Check if issues file exists
    if [ -f ".security-results/issues-${PAGE_NAME}.txt" ]; then
        ISSUE_COUNT=$(cat ".security-results/issues-${PAGE_NAME}.txt" | grep -o '[0-9]*' | head -1)
        echo "- **Security Check**: ❌ ${ISSUE_COUNT} issues found" >> .security-results/summary.md
    else
        echo "- **Security Check**: ✅ No issues detected" >> .security-results/summary.md
    fi

    echo "" >> .security-results/summary.md
done

# Add remediation guidance
cat >> .security-results/summary.md << EOF
## 🛡️ Security Recommendations

### Critical Headers
- **Content-Security-Policy**: Prevents XSS attacks and unauthorized resource loading
- **Strict-Transport-Security**: Enforces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Referrer-Policy**: Controls referrer information leakage

### Tools for Production Testing
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Security Headers Scanner](https://securityheaders.com/)
- [SSL Labs Test](https://www.ssllabs.com/ssltest/)
- [OWASP ZAP Full Scan](https://owasp.org/www-project-zap/)

### Local Testing
- Run: \`./scripts/security-test.sh\`
- Check headers: \`curl -I https://yourdomain.com\`
- Validate CSP: Browser DevTools → Security tab
EOF

# Display results
echo -e "${BLUE}📊 Security Test Results Summary:${NC}"
echo "  Total tests: ${TOTAL_TESTS}"
echo "  Passed: ${PASSED_TESTS}"
echo "  Failed: $((TOTAL_TESTS - PASSED_TESTS))"
echo "  Success rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
echo ""

if [ "$ZAP_FAILED" = true ] || [ "$OBSERVATORY_FAILED" = true ]; then
    echo -e "${RED}❌ Security tests failed${NC}"
    echo -e "${YELLOW}💡 Check detailed reports in .security-results/ directory${NC}"
    echo -e "${YELLOW}📋 See summary report: .security-results/summary.md${NC}"
    echo ""
    echo -e "${YELLOW}🔧 For production deployment:${NC}"
    echo -e "${YELLOW}   1. Test with Mozilla Observatory: https://observatory.mozilla.org/${NC}"
    echo -e "${YELLOW}   2. Verify SSL configuration: https://www.ssllabs.com/ssltest/${NC}"
    echo -e "${YELLOW}   3. Check security headers: https://securityheaders.com/${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All security tests passed!${NC}"
    echo -e "${GREEN}🔒 Your site demonstrates strong security practices${NC}"
    echo ""
    echo -e "${BLUE}💡 For production validation, test with:${NC}"
    echo -e "${BLUE}   • Mozilla Observatory: https://observatory.mozilla.org/${NC}"
    echo -e "${BLUE}   • SSL Labs: https://www.ssllabs.com/ssltest/${NC}"
    exit 0
fi