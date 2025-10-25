# Lab 1 

## Instalacja

```bash
npm run install:all
```

## Testy

```bash
npm test
npm run test:backend
npm run test:frontend
npm run test:e2e
```

## Struktura

**Backend:**
- `src/Calculator.php` - logika obliczeń
- `src/HistoryManager.php` - zarządzanie historią
- `tests/` - testy PHPUnit

**Frontend:**
- `src/App.jsx` - główny komponent
- `src/__tests__/` - testy Vitest

**E2E:**
- `e2e/calculator.spec.js` - testy Playwright

## Deployment

**Frontend:** Automatyczny deploy przez GitHub Actions do Azure Static Web Apps

**Backend:** Manualny deploy do Azure App Service:
```bash
cd backend
./deploy.sh
```

## CI/CD

GitHub Actions: Backend tests → Frontend tests → Build → E2E tests → Deploy (Azure)

