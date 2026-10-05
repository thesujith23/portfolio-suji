const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = code.replace(/<MagneticText text=\"Building\" strength={0.8} \/>/g, '<SparkleText text=\"Building\" />');
code = code.replace(/<MagneticText text=\"digital\" strength={0.8} \/>/g, '<SparkleText text=\"digital\" />');
code = code.replace(/<MagneticText text=\"experiences\" strength={0.8} \/>/g, '<SparkleText text=\"experiences\" />');
code = code.replace(/<MagneticText text=\"that\" strength={0.8} \/>/g, '<SparkleText text=\"that\" />');
code = code.replace(/<MagneticText text=\"matter\" strength={0.8} \/>/g, '<SparkleText text=\"matter\" />');
fs.writeFileSync('src/App.jsx', code);
