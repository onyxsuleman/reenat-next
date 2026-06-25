const fs = require('fs');
const path = require('path');

function updateDefaults() {
  const backupPath = path.join(__dirname, '..', 'backups', 'products_backup_2026-06-25.json');
  const appContextPath = path.join(__dirname, '..', 'src', 'context', 'AppContext.js');

  if (!fs.existsSync(backupPath)) {
    console.error("Backup file not found!");
    return;
  }

  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  console.log(`Loaded ${backupData.length} products from backup.`);

  // Map to the format expected by the app context
  const cleanProducts = backupData.map(p => {
    return {
      id: p.id,
      name: p.name || '',
      type: p.type || '',
      color: p.color || '',
      price: Number(p.price || 0),
      originalPrice: Number(p.originalprice || p.originalPrice || 0),
      image: p.image || '',
      image2: p.image2 || '',
      image3: p.image3 || '',
      origin: p.origin || '',
      craft: p.craft || '',
      desc: p.desc || '',
      gst: p.gst || '5',
      hsn: p.hsn || '',
      weight: Number(p.weight || 0),
      styleId: p.styleid || p.styleId || '',
      blouseLen: p.blouselen || p.blouseLen || '0.8',
      sareeLen: p.sareelen || p.sareeLen || '5.5',
      blouseType: p.blousetype || p.blouseType || '',
      blouseColor: p.blousecolor || p.blouseColor || '',
      transparency: p.transparency || 'No',
      qty: p.qty || 'Single',
      fabric: p.fabric || '',
      border: p.border || '',
      occasion: p.occasion || '',
      loom: p.loom || '',
      brand: p.brand || 'REENAT TRENDS',
      rating: Number(p.rating || 4.5)
    };
  });

  const appContextContent = fs.readFileSync(appContextPath, 'utf8');

  // Replace defaultProducts array
  // We locate the start and end of the defaultProducts array in the file
  const startMarker = 'const defaultProducts = [';
  const endMarker = '];\n\nexport function AppProvider';
  
  const startIndex = appContextContent.indexOf(startMarker);
  if (startIndex === -1) {
    console.error("Could not find defaultProducts start in AppContext.js");
    return;
  }

  // Find the closing bracket of the array
  // We can look for the next '];' followed by 'export function AppProvider' or look for 'export function AppProvider'
  const endMarkerIndex = appContextContent.indexOf('export function AppProvider');
  if (endMarkerIndex === -1) {
    console.error("Could not find AppProvider export in AppContext.js");
    return;
  }

  // Find the last '];' before the AppProvider export
  const searchSlice = appContextContent.substring(startIndex, endMarkerIndex);
  const lastBracketIndex = searchSlice.lastIndexOf('];');
  if (lastBracketIndex === -1) {
    console.error("Could not find matching ]; for defaultProducts");
    return;
  }

  const absoluteEndIndex = startIndex + lastBracketIndex + 2;

  const newArrayStr = `const defaultProducts = ${JSON.stringify(cleanProducts, null, 2)};`;

  const updatedContent = appContextContent.substring(0, startIndex) + 
                         newArrayStr + 
                         appContextContent.substring(absoluteEndIndex);

  fs.writeFileSync(appContextPath, updatedContent, 'utf8');
  console.log("AppContext.js updated successfully with all 11 default products.");
}

updateDefaults();
