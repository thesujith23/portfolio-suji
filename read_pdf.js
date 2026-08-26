const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('public/SujithResume.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
});
