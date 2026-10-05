const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
const lines = code.split('\n');
const newLines = [];
let added = false;
for (let i = 0; i < lines.length; i++) {
  newLines.push(lines[i]);
  if (!added && lines[i].includes('icon: \\'python/python-original.svg\\'')) {
    newLines[newLines.length - 1] = newLines[newLines.length - 1].replace('icon: \\'python/python-original.svg\\'', 'icon: \\'python/python-original.svg\\',');
    newLines.push('      mainImg: \\'nexus1.png\\',');
    newLines.push('      sideImg1: \\'nexus2.png\\'');
    added = true;
  }
}
fs.writeFileSync('src/App.jsx', newLines.join('\n'));
