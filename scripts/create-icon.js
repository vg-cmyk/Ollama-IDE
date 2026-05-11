const fs = require('fs');
const path = require('path');

// Простой скрипт для создания placeholder иконки
// В реальном проекте замените на настоящую иконку 256x256

const assetsDir = path.join(__dirname, '..', 'assets');
const iconPath = path.join(assetsDir, 'icon.ico');

// Создаём простую SVG иконку как placeholder
const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" fill="#1e1e1e"/>
  <text x="128" y="160" font-size="120" text-anchor="middle" fill="#cccccc" font-family="Arial">📝</text>
</svg>`;

// Сохраняем SVG как временный файл (для конвертации в ICO нужен sharp или онлайн конвертер)
const svgPath = path.join(assetsDir, 'icon.svg');
fs.writeFileSync(svgPath, svgContent);

console.log('✅ Создан placeholder: assets/icon.svg');
console.log('');
console.log('⚠️  Для создания настоящего .ico файла:');
console.log('   1. Откройте https://icoconvert.com/ или https://www.favicon.cc/');
console.log('   2. Загрузите картинку 256x256 или используйте emoji 📝');
console.log('   3. Скачайте результат как icon.ico');
console.log('   4. Положите файл в папку assets/icon.ico');
console.log('');
console.log('   Или используйте онлайн конвертер для assets/icon.svg');
