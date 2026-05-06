#!/bin/bash

# GitHub Pages Diagnostic Script
# This script checks for common GitHub Pages issues

echo "🔍 GitHub Pages Diagnostic Script"
echo "=================================="
echo ""

# Test 1: Check if npm build works locally
echo "Test 1: Building React app locally..."
npm run build > /tmp/build.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ npm run build: SUCCESS"
    BUILD_SIZE=$(du -sh ./build | cut -f1)
    echo "   Build size: $BUILD_SIZE"
else
    echo "❌ npm run build: FAILED"
    echo "   Last 20 lines of error:"
    tail -20 /tmp/build.log
fi

echo ""

# Test 2: Check if build directory exists
echo "Test 2: Checking build directory..."
if [ -d "./build" ]; then
    echo "✅ ./build directory exists"
    FILE_COUNT=$(find ./build -type f | wc -l)
    echo "   Files: $FILE_COUNT"
else
    echo "❌ ./build directory NOT FOUND"
fi

echo ""

# Test 3: Check index.html exists
echo "Test 3: Checking index.html..."
if [ -f "./build/index.html" ]; then
    echo "✅ ./build/index.html exists"
    FILE_SIZE=$(wc -c < ./build/index.html)
    echo "   Size: $FILE_SIZE bytes"
else
    echo "❌ ./build/index.html NOT FOUND"
fi

echo ""

# Test 4: Check GitHub workflow file
echo "Test 4: Checking GitHub Actions workflow..."
if [ -f "./.github/workflows/deploy-to-pages.yml" ]; then
    echo "✅ deploy-to-pages.yml exists"
    grep -q "deploy-pages" ./.github/workflows/deploy-to-pages.yml
    if [ $? -eq 0 ]; then
        echo "   ✅ Contains deploy-pages action"
    else
        echo "   ⚠️  Missing deploy-pages action"
    fi
else
    echo "❌ ./.github/workflows/deploy-to-pages.yml NOT FOUND"
fi

echo ""

# Test 5: Check package.json scripts
echo "Test 5: Checking npm scripts..."
grep -q '"build"' package.json && echo "✅ build script exists" || echo "❌ build script missing"
grep -q '"lint"' package.json && echo "✅ lint script exists" || echo "❌ lint script missing"
grep -q '"test"' package.json && echo "✅ test script exists" || echo "❌ test script missing"

echo ""

# Test 6: Check for common build errors
echo "Test 6: Checking for common issues..."
grep -r "process.env.PUBLIC_URL" src/ > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "⚠️  Found PUBLIC_URL references - may need configuration"
fi

echo ""
echo "✅ Diagnostic complete!"
echo ""
echo "📋 Summary:"
echo "============"
echo "If all tests pass, your website should work on GitHub Pages."
echo "If any test failed:"
echo "  1. Fix the issue locally"
echo "  2. Run: git add . && git commit -m 'fix' && git push origin main"
echo "  3. Wait for GitHub Actions to complete"
echo "  4. Check: https://github.com/ansongdan-code/addautomobiletraining/actions"

