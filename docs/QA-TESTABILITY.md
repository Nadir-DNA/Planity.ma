# Planity.ma - Guide de Testabilité QA

## Architecture de Test

### Structure des Tests

```
tests/
├── unit/                    # Tests unitaires (116+ tests)
│   ├── controllers/         # Controllers avec DI
│   ├── stores/              # Zustand state management
│   ├── hooks/               # React Query hooks
│   ├── components/          # React components
│   └── *.test.ts            # Services, validators, utils
│
├── integration/             # Tests API (68+ tests)
│   ├── api-search.test.ts   # Search endpoint
│   ├── api-bookings.test.ts # Bookings endpoint
│   └── api-*.test.ts        # Other endpoints
│
├── e2e/                     # Tests Playwright
│   ├── booking-flow.spec.ts # Complete booking journey
│   ├── auth-flow.spec.ts    # Authentication flows
│   └── *.spec.ts            # Other user journeys
│
├── factories/               # Mock data factories
│   └── index.ts             # createMockSalon, createMockBooking...
│
├── mocks/                   # MSW handlers
│   ├── handlers.ts          # API mock responses
│   └── server.ts            # Node test server
│
└── setup.ts                 # Global test setup
```

### Patterns de Testabilité

#### 1. Repository Pattern + DI
```typescript
// Interface
interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByReference(ref: string): Promise<Booking | null>;
}

// Implementation
class BookingRepository implements IBookingRepository { ... }

// Mock for tests
function createMockBookingRepository(): IBookingRepository { ... }
```

#### 2. Controller Pattern
```typescript
// API route uses controller
export async function POST(request: Request) {
  const container = getContainer();
  const result = await container.controllers.booking.createBooking(body);
  return NextResponse.json(result);
}

// Controller is testable with mock repos
const controller = createBookingController({
  bookingRepo: createMockBookingRepository(),
  serviceRepo: createMockServiceRepository(),
});
```

#### 3. Factory Pattern for Mocks
```typescript
// Generate test data
const salon = createMockSalon({ city: "Casablanca" });
const booking = createMockBooking({ status: "CONFIRMED" });
```

#### 4. MSW for Network Mocking
```typescript
// Mock API responses
server.use(
  http.get("/api/v1/search", () =>
    HttpResponse.json({ salons: [createMockSalon()] })
  )
);
```

### Commandes de Test

```bash
# Tests unitaires
npm run test:unit

# Tests avec coverage
npm run test:coverage

# Tests integration
npm run test:integration

# Tests E2E
npm run test:e2e

# Tous les tests
npm run test:all
```

### Coverage Actuelle

| Category | Coverage |
|----------|----------|
| Controllers | 84% |
| Validators | 100% |
| Utils | 100% |
| Stores | 100% |
| Hooks | 83% |
| Services | 0% (TODO: refactor) |

### CI/CD

Tests run automatically on:
- Push to `main` or `develop`
- Pull requests to `main`

Coverage uploaded to Codecov.

### Prochaines Étapes

1. Refactoriser `booking.service.ts` pour utiliser DI
2. Ajouter tests pour `salon.service.ts`
3. Augmenter coverage thresholds progressivement
4. Ajouter tests E2E pour flows critiques

---

## Ajouter un Nouveau Test

### Test Unitaire Service
```typescript
import { describe, it, expect, vi } from "vitest";

describe("MyService", () => {
  it("should do something", async () => {
    const mockRepo = createMockRepository();
    const service = createMyService({ repo: mockRepo });
    
    const result = await service.doSomething();
    expect(result.success).toBe(true);
  });
});
```

### Test Composant React
```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("MyComponent", () => {
  it("should render", () => {
    render(React.createElement(MyComponent));
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

### Test API Integration
```typescript
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";

describe("API endpoint", () => {
  it("should return data", async () => {
    server.use(
      http.get("/api/v1/endpoint", () =>
        HttpResponse.json({ data: [] })
      )
    );
    
    const res = await fetch("/api/v1/endpoint");
    expect(res.ok).toBe(true);
  });
});
```

### Test E2E Playwright
```typescript
import { test, expect } from "@playwright/test";

test("user journey", async ({ page }) => {
  await page.goto("/");
  await page.click("button");
  await expect(page.locator("h1")).toBeVisible();
});
```
