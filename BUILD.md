# Как собрать OllamaIDE в .exe

## Подготовка
1. Убедись что Node.js 18+ установлен
2. Положи icon.ico в папку assets/
3. Установи зависимости: `npm install`

## Создание иконки

### Вариант A: Автоматически (placeholder)
```bash
npm run create-icon
```
Затем сконвертируйте созданный `assets/icon.svg` в `.ico` через онлайн конвертер.

### Вариант B: Вручную
1. Зайди на https://www.favicon.cc/ или https://icoconvert.com/
2. Создай или загрузи картинку 256x256
3. Скачай как .ico
4. Положи в папку `assets/icon.ico`

## Сборка

### Вариант 1: Установщик (.exe installer)
Запускает мастер установки, создаёт ярлык на рабочем столе
```bash
npm run build:win
```
Готовый файл: `release/OllamaIDE Setup 1.0.0.exe`

### Вариант 2: Portable (.exe без установки)
Один файл, можно запускать с флешки
```bash
npm run dist
```
Готовый файл: `release/OllamaIDE-portable.exe`

## Что получится
```
release/
├── OllamaIDE Setup 1.0.0.exe  ← установщик
├── OllamaIDE-portable.exe      ← портативная версия
└── win-unpacked/               ← папка с файлами
```

## Важно
- Ollama должна быть установлена отдельно (https://ollama.ai)
- При первом запуске Windows может показать предупреждение SmartScreen — нажать "Подробнее" → "Запустить"
- Для убрать предупреждение нужна подпись кода (Code Signing), это платно ~$200/год, для личного использования не нужно

## Запуск в режиме разработки
```bash
npm run dev
```

## Структура проекта
```
ollamaIDE/
├── main.js                 # Главный процесс Electron
├── preload.js              # contextBridge API
├── package.json            # Зависимости и скрипты
├── vite.config.js          # Конфигурация Vite
├── assets/
│   └── icon.ico            # Иконка приложения
├── scripts/
│   └── create-icon.js      # Скрипт создания иконки
└── src/
    ├── App.jsx             # Главный компонент
    ├── index.css           # Глобальные стили
    ├── index.html          # HTML шаблон
    ├── main.jsx            # Точка входа React
    └── components/
        ├── AIPanel/        # AI ассистент с Ollama
        ├── Editor/         # Monaco Editor
        ├── FileTree/       # Файловый проводник
        ├── Tabs/           # Вкладки файлов
        └── Splash/         # Экран загрузки
```
