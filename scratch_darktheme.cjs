const fs = require('fs');
let c = fs.readFileSync('src/App.jsx', 'utf8');

c = c.replace(
    /char\.style\.color = char\.dataset\.highlight === 'true' \? '#F62440' : '#1a1a1a';/g,
    "char.style.color = char.dataset.highlight === 'true' ? '#F62440' : '#ffffff';"
);

fs.writeFileSync('src/App.jsx', c);
console.log('App.jsx color updated');
