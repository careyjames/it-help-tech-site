#!/bin/bash

# accessibility-test.sh - Enhanced accessibility testing with axe-core and Pa11y
# Run comprehensive accessibility checks on the built site

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}♿ IT Help Tech - Enhanced Accessibility Testing${NC}"
echo "=================================================="

# Test URLs
URLS=(
    "http://localhost:8080/"
    "http://localhost:8080/services/"
    "http://localhost:8080/billing/"
    "http://localhost:8080/about/"
    "http://localhost:8080/blog/"
)

# Create results directory
mkdir -p .accessibility-results
rm -rf .accessibility-results/*

echo -e "${YELLOW}🔍 Running accessibility tests on ${#URLS[@]} pages...${NC}"

# Track overall results
TOTAL_TESTS=0
PASSED_TESTS=0
AXECORE_FAILED=false
PA11Y_FAILED=false

# Test each URL with both tools
for url in "${URLS[@]}"; do
    PAGE_NAME=$(echo "$url" | sed 's|http://localhost:8080/||' | sed 's|/$||' | sed 's|^$|homepage|')
    echo -e "${BLUE}Testing: ${url} (${PAGE_NAME})${NC}"

    # axe-core testing
    echo -e "${YELLOW}  📊 Running axe-core...${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if npx axe "$url" --save ".accessibility-results/axe-${PAGE_NAME}.json" --exit > /dev/null 2>&1; then
        echo -e "${GREEN}  ✅ axe-core: No violations found${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}  ❌ axe-core: Violations detected${NC}"
        AXECORE_FAILED=true
        # Generate human-readable report
        npx axe "$url" --stdout > ".accessibility-results/axe-${PAGE_NAME}.txt" 2>&1 || true
    fi

    # Pa11y testing
    echo -e "${YELLOW}  📋 Running Pa11y...${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    # Pa11y returns exit code 2 when issues are found, 0 for no issues, 1+ for errors
    npx pa11y "$url" --reporter json > ".accessibility-results/pa11y-${PAGE_NAME}.json" 2>&1
    PA11Y_EXIT_CODE=$?

    if [ $PA11Y_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}  ✅ Pa11y: No issues found${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [ $PA11Y_EXIT_CODE -eq 2 ]; then
        # Pa11y found accessibility issues (exit code 2)
        ISSUE_COUNT=$(grep -c '"code":' ".accessibility-results/pa11y-${PAGE_NAME}.json" 2>/dev/null || echo "0")
        ISSUE_COUNT=$(echo "$ISSUE_COUNT" | head -1)  # Take only first number if multiple lines
        echo -e "${RED}  ❌ Pa11y: ${ISSUE_COUNT} issues found${NC}"
        PA11Y_FAILED=true
        # Generate human-readable report
        npx pa11y "$url" --reporter cli > ".accessibility-results/pa11y-${PAGE_NAME}.txt" 2>&1 || true
    else
        # Pa11y had an actual error (exit code 1 or other)
        echo -e "${RED}  ❌ Pa11y: Test failed (exit code: $PA11Y_EXIT_CODE)${NC}"
        PA11Y_FAILED=true
        echo "Pa11y test failed for $url with exit code $PA11Y_EXIT_CODE" > ".accessibility-results/pa11y-${PAGE_NAME}.txt"
    fi

    echo ""
done

# Generate summary report
echo -e "${BLUE}📋 Generating accessibility summary...${NC}"

cat > .accessibility-results/summary.md << EOF
# 🔍 Accessibility Test Results

## Summary
- **Total tests run**: ${TOTAL_TESTS}
- **Tests passed**: ${PASSED_TESTS}
- **Tests failed**: $((TOTAL_TESTS - PASSED_TESTS))
- **Success rate**: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%

## Test Results by Page

EOF

# Add detailed results for each page
for url in "${URLS[@]}"; do
    PAGE_NAME=$(echo "$url" | sed 's|http://localhost:8080/||' | sed 's|/$||' | sed 's|^$|homepage|')
    DISPLAY_NAME=$(echo "$PAGE_NAME" | sed 's|^homepage$|Homepage|' | sed 's|\b\w|\U&|g')

    echo "### ${DISPLAY_NAME}" >> .accessibility-results/summary.md
    echo "**URL**: \`${url}\`" >> .accessibility-results/summary.md
    echo "" >> .accessibility-results/summary.md

    # Check axe-core results
    if [ -f ".accessibility-results/axe-${PAGE_NAME}.json" ]; then
        # Count actual violation objects by looking for violation IDs
        VIOLATIONS=$(grep -c '"id":.*"impact"' ".accessibility-results/axe-${PAGE_NAME}.json" 2>/dev/null || echo "0")
        VIOLATIONS=$(echo "$VIOLATIONS" | head -1)  # Take only first number if multiple lines
        if [ "$VIOLATIONS" -eq 0 ]; then
            echo "- **axe-core**: ✅ No violations" >> .accessibility-results/summary.md
        else
            echo "- **axe-core**: ❌ Violations detected (see \`axe-${PAGE_NAME}.txt\`)" >> .accessibility-results/summary.md
        fi
    else
        echo "- **axe-core**: ❌ Test failed" >> .accessibility-results/summary.md
    fi

    # Check Pa11y results
    if [ -f ".accessibility-results/pa11y-${PAGE_NAME}.json" ]; then
        # Count actual Pa11y issues by looking for code field
        ISSUE_COUNT=$(grep -c '"code":' ".accessibility-results/pa11y-${PAGE_NAME}.json" 2>/dev/null || echo "0")
        ISSUE_COUNT=$(echo "$ISSUE_COUNT" | head -1)  # Take only first number if multiple lines
        if [ "$ISSUE_COUNT" -eq 0 ]; then
            echo "- **Pa11y**: ✅ No issues" >> .accessibility-results/summary.md
        else
            echo "- **Pa11y**: ❌ ${ISSUE_COUNT} issues found (see \`pa11y-${PAGE_NAME}.txt\`)" >> .accessibility-results/summary.md
        fi
    else
        echo "- **Pa11y**: ❌ Test failed" >> .accessibility-results/summary.md
    fi

    echo "" >> .accessibility-results/summary.md
done

# Add remediation tips
cat >> .accessibility-results/summary.md << EOF
## 💡 Remediation Resources

### Common Issues & Fixes
- **Missing alt text**: Add descriptive \`alt\` attributes to images
- **Low contrast**: Ensure text meets WCAG contrast ratios (4.5:1 for normal text)
- **Missing labels**: Add \`aria-label\` or associated \`<label>\` elements for form controls
- **Heading structure**: Use proper heading hierarchy (h1 → h2 → h3)
- **Focus management**: Ensure all interactive elements are keyboard accessible

### Documentation
- [axe-core Rules](https://dequeuniversity.com/rules/axe/)
- [Pa11y Documentation](https://pa11y.org/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Resources](https://webaim.org/)

### Testing Tools
- Run locally: \`./scripts/accessibility-test.sh\`
- Browser extensions: axe DevTools, WAVE
- Screen readers: NVDA, JAWS, VoiceOver
EOF

# Display results
echo -e "${BLUE}📊 Test Results Summary:${NC}"
echo "  Total tests: ${TOTAL_TESTS}"
echo "  Passed: ${PASSED_TESTS}"
echo "  Failed: $((TOTAL_TESTS - PASSED_TESTS))"
echo "  Success rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
echo ""

if [ "$AXECORE_FAILED" = true ] || [ "$PA11Y_FAILED" = true ]; then
    echo -e "${RED}❌ Accessibility tests failed${NC}"
    echo -e "${YELLOW}💡 Check detailed reports in .accessibility-results/ directory${NC}"
    echo -e "${YELLOW}📋 See summary report: .accessibility-results/summary.md${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All accessibility tests passed!${NC}"
    echo -e "${GREEN}♿ Your site meets enhanced accessibility standards${NC}"
    exit 0
fi