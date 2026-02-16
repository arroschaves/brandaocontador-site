#!/usr/bin/env node
/**
 * Project Health Check - Vercel Build Hook
 * Validates essential project configuration before deployment.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Essential files that must exist for a successful build
const requiredFiles = [
    'package.json',
    'next.config.js',
    'tsconfig.json',
    'middleware.ts',
    'app/layout.tsx',
    'app/page.tsx',
];

// Optional check — warn but do not fail
const optionalChecks = [
    'vercel.json',
    'tailwind.config.js',
    'postcss.config.js',
];

let exitCode = 0;

console.log('🏥 Project Health Check');
console.log('='.repeat(40));

// 1. Check required files
console.log('\n📁 Required Files:');
for (const file of requiredFiles) {
    const fullPath = path.join(ROOT, file);
    if (fs.existsSync(fullPath)) {
        console.log(`  ✅ ${file}`);
    } else {
        // next.config.js may be next.config.mjs or next.config.ts — try alternatives
        if (file === 'next.config.js') {
            const alts = ['next.config.mjs', 'next.config.ts'];
            const found = alts.some(a => fs.existsSync(path.join(ROOT, a)));
            if (found) {
                console.log(`  ✅ ${file} (via alternative extension)`);
                continue;
            }
        }
        console.log(`  ❌ MISSING: ${file}`);
        exitCode = 1;
    }
}

// 2. Check optional files
console.log('\n📋 Optional Files:');
for (const file of optionalChecks) {
    const fullPath = path.join(ROOT, file);
    if (fs.existsSync(fullPath)) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ⚠️  ${file} (not found, but optional)`);
    }
}

// 3. Check environment variables
console.log('\n🔐 Environment Variables:');
const envVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];
for (const v of envVars) {
    if (process.env[v]) {
        console.log(`  ✅ ${v} (set)`);
    } else {
        console.log(`  ⚠️  ${v} (not set — may cause runtime issues)`);
    }
}

// 4. Package.json scripts check
console.log('\n📦 Package Scripts:');
try {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    const requiredScripts = ['build', 'dev', 'start'];
    for (const s of requiredScripts) {
        if (pkg.scripts && pkg.scripts[s]) {
            console.log(`  ✅ npm run ${s}`);
        } else {
            console.log(`  ❌ MISSING script: ${s}`);
            exitCode = 1;
        }
    }
} catch (e) {
    console.log('  ❌ Could not read package.json');
    exitCode = 1;
}

console.log('\n' + '='.repeat(40));
if (exitCode === 0) {
    console.log('✅ All health checks passed!');
} else {
    console.log('❌ Some health checks FAILED. Fix issues above.');
}

process.exit(exitCode);
