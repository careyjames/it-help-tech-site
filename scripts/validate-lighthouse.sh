#!/bin/bash

# validate-lighthouse.sh - Local Lighthouse performance validation
# Run this script before pushing PRs to ensure they pass performance gates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 IT Help Tech - Lighthouse Performance Validation${NC}"
echo "=================================================="

# Check dependencies
echo -e "${YELLOW}📦 Checking dependencies...${NC}"

# Check Zola (system dependency)
if ! command -v zola &> /dev/null; then
    echo -e "${RED}❌ Zola is not installed. Please install it first:${NC}"
    echo "   cargo install zola"
    echo "   # OR via package manager (brew install zola, etc.)"
    exit 1
fi

# Check Node.js dependencies
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing npm dependencies...${NC}"
    if ! npm install; then
        echo -e "${RED}❌ Failed to install npm dependencies${NC}"
        exit 1
    fi
fi

# Verify key tools are available via npx
if ! npx --quiet lhci --version > /dev/null 2>&1; then
    echo -e "${RED}❌ Lighthouse CI not available. Try: npm install${NC}"
    exit 1
fi

# Clean previous build
echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
rm -rf public/

# Build site
echo -e "${YELLOW}🏗️  Building site with Zola...${NC}"
if ! zola build; then
    echo -e "${RED}❌ Zola build failed${NC}"
    exit 1
fi

if [ ! -d "public" ]; then
    echo -e "${RED}❌ Build failed - public directory not created${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Site built successfully${NC}"

# Purge CSS
echo -e "${YELLOW}✂️  Purging unused CSS...${NC}"
npx purgecss --css public/css/*.css --content public/**/*.html --output public/css/ --safelist "phone-line"

# Copy assets
echo -e "${YELLOW}📁 Copying assets...${NC}"
./scripts/copy-assets.sh

echo -e "${GREEN}✅ Assets copied${NC}"

# Server detection and management
EXTERNAL_SERVER=false
SERVER_PID=""

# Check if server is already running on port 8080
if curl -s http://localhost:8080/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Using existing server on port 8080${NC}"
    EXTERNAL_SERVER=true
else
    # Setup cleanup only if we start our own server
    cleanup() {
        if [ ! -z "$SERVER_PID" ]; then
            kill $SERVER_PID 2>/dev/null || true
            echo -e "${BLUE}🧹 Server cleaned up${NC}"
        fi
    }
    trap cleanup EXIT INT TERM

    # Start our own server
    echo -e "${YELLOW}🚀 Starting development server...${NC}"
    npx http-server public -p 8080 -s &
    SERVER_PID=$!

    # Wait for server
    echo -e "${YELLOW}⏳ Waiting for server to start...${NC}"
    for i in {1..10}; do
        if curl -s http://localhost:8080/ > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Server is ready at http://localhost:8080${NC}"
            break
        fi
        if [ $i -eq 10 ]; then
            echo -e "${RED}❌ Server failed to start${NC}"
            exit 1
        fi
        sleep 1
    done
fi

# Run Lighthouse
echo -e "${YELLOW}🔍 Running Lighthouse performance tests...${NC}"
echo "   This will test the following pages:"
echo "   • Homepage (http://localhost:8080/)"
echo "   • Services page (http://localhost:8080/services/)"
echo "   • Billing page (http://localhost:8080/billing/)"
echo "   • About page (http://localhost:8080/about/)"
echo "   • Blog page (http://localhost:8080/blog/)"
echo ""

if npx lhci autorun --config=.lighthouserc.js; then
    echo ""
    echo -e "${GREEN}🎉 All performance gates passed!${NC}"
    echo -e "${GREEN}✅ Your PR is ready for submission${NC}"
    
    # Show summary
    echo ""
    echo -e "${BLUE}📊 Performance Requirements Met:${NC}"
    echo "   • Performance: ≥90"
    echo "   • Accessibility: ≥90" 
    echo "   • Best Practices: ≥95"
    echo "   • SEO: ≥95"
    echo "   • LCP: <2.5s"
    echo "   • FCP: <1.2s"
    echo "   • CLS: <0.1"
    echo "   • TBT: <300ms"
else
    echo ""
    echo -e "${RED}❌ Performance gates failed${NC}"
    echo -e "${RED}🚫 Your PR will be blocked until these issues are resolved${NC}"
    echo ""
    echo -e "${YELLOW}💡 Tips for improvement:${NC}"
    echo "   • Check the detailed reports in .lighthouseci/ directory"
    echo "   • Optimize images (ensure AVIF/WebP formats are used)"
    echo "   • Review CSS bundle size"
    echo "   • Check for render-blocking resources"
    echo "   • Validate HTML structure and accessibility"
    exit 1
fi