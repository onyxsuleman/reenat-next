const fs = require('fs');
const path = require('path');

const backupsDir = path.join(__dirname, '..', 'backups');
const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  try {
    const filePath = path.join(backupsDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (Array.isArray(content)) {
      const found56 = content.find(p => p.id === 56 || p.id === '56');
      const found60 = content.find(p => p.id === 60 || p.id === '60');
      const foundM2 = content.filter(p => (p.catalog_id && p.catalog_id.toUpperCase() === 'M2') || (p.catalogId && p.catalogId.toUpperCase() === 'M2') || (p.styleid && p.styleid.startsWith('M2')));
      console.log(`\n=== File: ${file} ===`);
      console.log(`Found ID 56:`, found56 ? { id: found56.id, name: found56.name, color: found56.color, styleid: found56.styleid } : 'NO');
      console.log(`Found ID 60:`, found60 ? { id: found60.id, name: found60.name, color: found60.color, styleid: found60.styleid } : 'NO');
      console.log(`Total M2 products: ${foundM2.length}`);
      if (foundM2.length > 0) {
        foundM2.forEach(m => console.log(`  - ID: ${m.id}, color: ${m.color}, styleid: ${m.styleid || m.styleId}`));
      }
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
});
