#!/bin/bash

# copy-assets.sh - Copy static assets to build output directory
# Used by both development and CI workflows

set -e

BUILD_DIR="${1:-public}"

echo "📁 Copying assets to ${BUILD_DIR}..."

# Create build directory if it doesn't exist
mkdir -p "$BUILD_DIR"

# Copy images directory
if [ -d "static/images" ]; then
    cp -r static/images "$BUILD_DIR/"
    echo "  ✅ Images copied"
fi

# Copy root files (HTML, icons, SVG, robots.txt)
# Exclude llms*.txt files (handled separately in deploy with special headers)
find static -maxdepth 1 -type f \( \
    -name "*.html" -o \
    -name "*.ico" -o \
    -name "*.svg" -o \
    -name "robots.txt" \
\) -exec cp {} "$BUILD_DIR/" \;

echo "  ✅ Root files copied"
echo "📁 Asset copying complete"