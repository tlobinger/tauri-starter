#!/bin/bash

# Project Structure Verification Script
# This script verifies that all required files from PROJECT-GOAL.md are present

echo "🔍 Verifying Tauri + Next.js Starter Project Structure..."
echo ""

ERRORS=0

check_file() {
    if [ -f "$1" ]; then
        echo "✅ $1"
    else
        echo "❌ MISSING: $1"
        ((ERRORS++))
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo "✅ $1/"
    else
        echo "❌ MISSING: $1/"
        ((ERRORS++))
    fi
}

echo "📁 Checking Directory Structure..."
echo ""

check_dir "apps/desktop"
check_dir "apps/desktop/app"
check_dir "apps/desktop/src"
check_dir "apps/desktop/src/components"
check_dir "apps/desktop/src/lib"
check_dir "apps/desktop/src-tauri"
check_dir "apps/desktop/src-tauri/src"
check_dir "apps/desktop/public"
check_dir "packages/db"
check_dir "packages/db/schema"
check_dir "packages/db/migrations"
check_dir "tests"
check_dir "tests/unit"
check_dir "tests/e2e"
check_dir "docs"

echo ""
echo "📄 Checking Configuration Files..."
echo ""

check_file "package.json"
check_file "biome.json"
check_file "bunfig.toml"
check_file "tsconfig.json"
check_file ".gitignore"

echo ""
echo "📄 Checking Desktop App Files..."
echo ""

check_file "apps/desktop/package.json"
check_file "apps/desktop/next.config.js"
check_file "apps/desktop/tsconfig.json"
check_file "apps/desktop/app/layout.tsx"
check_file "apps/desktop/app/page.tsx"
check_file "apps/desktop/app/globals.css"
check_file "apps/desktop/src/components/TodoList.tsx"
check_file "apps/desktop/src/lib/db.ts"

echo ""
echo "📄 Checking Tauri Backend Files..."
echo ""

check_file "apps/desktop/src-tauri/Cargo.toml"
check_file "apps/desktop/src-tauri/tauri.conf.json"
check_file "apps/desktop/src-tauri/build.rs"
check_file "apps/desktop/src-tauri/src/main.rs"
check_file "apps/desktop/src-tauri/src/lib.rs"
check_file "apps/desktop/src-tauri/src/db.rs"

echo ""
echo "📄 Checking Database Files..."
echo ""

check_file "packages/db/package.json"
check_file "packages/db/drizzle.config.ts"
check_file "packages/db/index.ts"
check_file "packages/db/schema/todos.ts"
check_file "packages/db/schema/index.ts"
check_file "packages/db/tauri-adapter.ts"
check_file "packages/db/migrator.ts"
check_file "packages/db/migrations/0000_initial_schema.sql"

echo ""
echo "📄 Checking Test Files..."
echo ""

check_file "tests/unit/db.test.ts"
check_file "tests/e2e/todo.test.ts"

echo ""
echo "📄 Checking Documentation..."
echo ""

check_file "README.md"
check_file "apps/desktop/README.md"
check_file "packages/db/README.md"
check_file "tests/README.md"
check_file "docs/STARTER_BLUEPRINT.md"
check_file "CONTRIBUTING.md"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo "✅ SUCCESS: All required files are present!"
    echo ""
    echo "📊 Project Statistics:"
    echo "   - Total TypeScript files: $(find . -name '*.ts' -o -name '*.tsx' | grep -v node_modules | wc -l)"
    echo "   - Total Rust files: $(find . -name '*.rs' | wc -l)"
    echo "   - Total documentation files: $(find . -name '*.md' | wc -l)"
    echo "   - Total configuration files: $(find . -name '*.json' -o -name '*.toml' | grep -v node_modules | wc -l)"
    echo ""
    echo "🚀 Project is ready!"
    echo ""
    echo "Next steps:"
    echo "  1. Install Bun: curl -fsSL https://bun.sh/install | bash"
    echo "  2. Install Rust: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    echo "  3. Install dependencies: bun install"
    echo "  4. Run dev server: bun run tauri:dev"
    exit 0
else
    echo "❌ ERRORS: $ERRORS file(s) or directory(ies) missing"
    echo ""
    echo "Please review the missing items above."
    exit 1
fi
