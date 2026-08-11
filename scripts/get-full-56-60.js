const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'backups', 'products_backup_2026-07-20.json');
const products = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const p56 = products.find(p => p.id === 56 || p.id === '56');
const p60 = products.find(p => p.id === 60 || p.id === '60');

console.log("=== FULL PRODUCT 56 ===");
console.log(JSON.stringify(p56, null, 2));

console.log("\n=== FULL PRODUCT 60 ===");
console.log(JSON.stringify(p60, null, 2));
