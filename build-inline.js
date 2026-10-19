const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf-8');
const css = fs.readFileSync('index.css', 'utf-8');
const js = fs.readFileSync('main.js', 'utf-8');

// Replace <link rel="stylesheet" href="index.css"> with <style>...</style>
let updatedHtml = html.replace(
  '<link rel="stylesheet" href="index.css">',
  `<style>\n${css}\n</style>`
);

// Replace <script src="main.js"></script> with <script>...</script>
updatedHtml = updatedHtml.replace(
  '<script src="main.js"></script>',
  `<script>\n${js}\n</script>`
);

fs.writeFileSync('index.html', updatedHtml, 'utf-8');
console.log('Successfully bundled CSS & JS into index.html!');
