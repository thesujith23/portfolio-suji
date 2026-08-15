const fs = require('fs');
['src/App.jsx', 'src/index.css'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let fixed = content
    .replace(/RÃ©sumÃ©/g, 'Résumé')
    .replace(/â€”/g, '—')
    .replace(/â•/g, '═')
    .replace(/Â°/g, '°')
    .replace(/â†—/g, '↗')
    .replace(/âœ–ï¸ /g, '✖️')
    .replace(/ðŸ‘¤/g, '👤')
    .replace(/ðŸ’¼/g, '💼')
    .replace(/ðŸš€/g, '🚀')
    .replace(/ðŸ”§/g, '🔧')
    .replace(/ðŸ“¬/g, '📬')
    .replace(/âš¡/g, '⚡')
    .replace(/â”€/g, '─');
  fs.writeFileSync(file, fixed, 'utf8');
});
console.log('Fixed encodings.');
