const fs = require('fs');
const path = require('path');

const filePath = 'C:/Users/Onyx/.gemini/antigravity-ide/brain/ad21abf3-cab6-4c46-9171-9bf1276b0fac/.system_generated/steps/181/content.md';
if (!fs.existsSync(filePath)) {
  console.log('File does not exist');
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

// Look for .css links
const cssMatches = content.match(/https?:\/\/[^\s"'`]+\.css/gi) || [];
console.log('CSS Matches:', cssMatches);

// Look for style insertions
const styleMatches = content.match(/createElement\(['"]style['"]\)/gi) || [];
console.log('Style element creations:', styleMatches.length);

// Look for styling keywords
const inlineStyles = content.match(/style\.[a-z]+/gi) || [];
console.log('Inline style setting count:', inlineStyles.length);
if (inlineStyles.length > 0) {
  console.log('Some inline style setters:', inlineStyles.slice(0, 10));
}
