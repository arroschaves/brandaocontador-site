/**
 * Project Health Check Script
 * Verifies critical project structure and environment.
 */
const fs = require('fs');
const path = require('path');

console.log('🔍 Running Project Health Check...');

const checks = [
    { name: 'Package.json exists', check: () => fs.existsSync('package.json') },
    { name: 'App directory exists', check: () => fs.existsSync('app') },
    { name: 'Tailwind config exists', check: () => fs.existsSync('tailwind.config.js') },
    { name: 'Supabase Lib exists', check: () => fs.existsSync('lib/supabase') },
];

let failed = false;
checks.forEach(test => {
    if (test.check()) {
        console.log(`✅ ${test.name}`);
    } else {
        console.error(`❌ ${test.name} FAILED`);
        failed = true;
    }
});

if (failed) {
    console.error('\n🚨 Project health check failed!');
    process.exit(1);
} else {
    console.log('\n✨ Project health check passed!');
}
