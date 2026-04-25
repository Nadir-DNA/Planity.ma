# Tests Planity.ma

## Structure

```
tests/
├── unit/                        # Tests unitaires Vitest
│   ├── availability.test.ts     # Moteur de disponibilités (8+ tests)
│   ├── utils.test.ts            # Utilitaires (6 tests)
│   ├── validators.test.ts       # Schémas Zod (12 tests)
│   ├── booking.service.test.ts  # Service de réservation (10+ tests)
│   ├── salon.service.test.ts    # Service de salon (8+ tests)
│   └── notification.service.test.ts # Service de notification (10+ tests)
├── integration/                 # Tests d'intégration API
│   ├── api-search.test.ts       # /api/v1/search (10 tests)
│   ├── api-availability.test.ts # /api/v1/availability (9 tests)
│   ├── api-bookings.test.ts     # /api/v1/bookings (12 tests)
│   ├── api-salons.test.ts       # /api/v1/salons (8 tests)
│   └── api-reviews.test.ts      # /api/v1/reviews (12 tests)
├── e2e/                         # Tests E2E Playwright
│   ├── consumer-flow.spec.ts    # Recherche → Salon → Réservation (10 tests)
│   ├── pro-onboarding.spec.ts   # Inscription → Configuration (7 tests)
│   ├── pro-dashboard.spec.ts    # Agenda → Clients → Caisse (14 tests)
│   ├── auth-flow.spec.ts        # Inscription → Connexion → Session (12 tests)
│   └── admin-flow.spec.ts       # Dashboard → Modération → Gestion (18 tests)
├── fixtures/                    # Données mock
│   └── mock-data.ts             # Salons, services, staff, bookings, users, reviews
├── README.md                    # Ce fichier
└── playwright.config.ts         # Config Playwright
```

## Lancer les tests

### Tests unitaires
```bash
npm run test:unit              # Tous les tests unitaires
npm run test:unit:watch        # Mode watch
npm run test:coverage          # Avec coverage report
```

### Tests d'intégration
```bash
npm run test:integration       # Tous les tests d'intégration
```

### Tests E2E
```bash
npm run test:e2e               # Tous les tests E2E (chromium, firefox, mobile)
npm run test:e2e:headed        # Avec navigateur visible (debug)
npx playwright test --project=chromium  # Un seul navigateur
npx playwright test tests/e2e/consumer-flow.spec.ts  # Un seul fichier
```

### Tout lancer
```bash
npm run test:all               # Unit + Intégration + E2E
```

## Configuration

### Vitest (`vitest.config.ts`)
- Environnement: node
- Alias: `@/` → `./src/`
- Coverage: v8, inclut `src/**/*.ts` et `src/**/*.tsx`

### Playwright (`tests/playwright.config.ts`)
- Base URL: `http://localhost:3000`
- Projets: chromium, firefox, Mobile Chrome (Pixel 5)
- Web server: `npm run dev` (auto-start)
- Screenshots: uniquement en cas d'échec
- Traces: premier retry

### Base de données de test
```bash
# Lancer les services Docker
docker compose -f docker/docker-compose.yml up -d

# Push le schema et seed
npx prisma db push
npm run db:seed
```

## Bonnes pratiques

1. **Tests unitaires**: Tester les fonctions pures (availability, utils, validators, services)
2. **Tests intégration**: Tester les API routes avec une vraie DB
3. **Tests E2E**: Tester les parcours utilisateurs complets
4. **Idempotence**: Les tests doivent pouvoir être relancés plusieurs fois
5. **Noms descriptifs**: Utiliser des noms de tests en français clairs
6. **Assertions**: Toujours vérifier le résultat attendu
7. **Mock**: Utiliser `vi.mock()` pour les dépendances externes
8. **Cleanup**: Utiliser `beforeEach` / `afterEach` pour reset les mocks

## Couverture cible

- **Unitaires**: >80% de couverture
- **Intégration**: Toutes les API routes testées (GET, POST, edge cases)
- **E2E**: Tous les parcours critiques couverts

## Nombre de tests

| Type | Fichiers | Tests |
|------|----------|-------|
| Unitaires | 6 | ~55 |
| Intégration | 5 | ~50 |
| E2E | 5 | ~60 |
| **Total** | **16** | **~165** |
