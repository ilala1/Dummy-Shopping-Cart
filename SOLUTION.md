# Solution: Retail cart BFF + React Native client

Monorepo layout:

- `bff/` — NestJS Backend-for-Frontend (in-memory catalogue, discounts, carts, reservations, checkout).
- `mobile/` — Expo (React Native + TypeScript) customer app using an **atomic UI layout** (`components/atoms`, `components/molecules`, `components/organisms`) plus screens and React Navigation.

## Prerequisites

- Node.js 20+ (see `react-native` engine in `bff` / RN tooling).
- npm 9+ (workspaces).
- **iOS simulator:** Full **Xcode** from the App Store.

From the repository root:

```bash
npm install
```

## Run the BFF

```bash
cd bff
npm run start:dev
```

The API listens on **http://127.0.0.1:3000** by default (`PORT` env overrides).

CORS is enabled for local mobile clients.

### Endpoints (summary)

| Method | Path | Purpose |
|--------|------|--------|
| `GET` | `/products` | List products with `availableStock` (stock minus all cart reservations). |
| `GET` | `/products/:id` | Product detail. |
| `GET` | `/discounts` | Active discount definitions (seed data). |
| `GET` | `/discounts/:id` | Single discount. |
| `POST` | `/carts` | Create cart (shopping session). |
| `GET` | `/carts/:cartId` | Cart snapshot + discount **preview** (same engine as checkout). |
| `POST` | `/carts/:cartId/items` | Body `{ productId, quantity }` — reserve/update line. |
| `DELETE` | `/carts/:cartId/items/:productId` | Remove line (releases reservation). |
| `POST` | `/carts/:cartId/checkout` | Fulfill order or fail with structured error; releases cart reservations in both cases. |

## Run the React Native app

1. Start the BFF (above).

2. From repo root:

```bash
cd mobile
npm install
npm run start
```

Then open in **iOS Simulator**, **Android Emulator**, or **Expo Go** via the QR code.

### BFF URL on the device

Default base URL is chosen in `mobile/src/config/env.ts`:

- **iOS simulator**: `http://127.0.0.1:3000`
- **Android emulator**: `http://10.0.2.2:3000` (maps to host loopback)

Override anytime:

```bash
EXPO_PUBLIC_BFF_URL=http://192.168.1.10:3000 npm run start
```

### App architecture (mobile)

- **Atoms**: `AppText`, `PrimaryButton`, `ScreenContainer`, `MoneyText`, `StockBadge`, `LoadingBlock`.
- **Molecules**: `ProductListRow`, `CartLineRow`, `QuantityStepper`, `ErrorCallout`, `SectionHeader`.
- **Organisms**: `ProductCatalogList`, `ProductDetailPanel`, `CartPanel`.
- **State**: `ShopSessionContext` holds `cartId` (persisted with AsyncStorage), syncs cart snapshot from the BFF, handles 410 “cart expired” by creating a new cart.

Screens: Products → Product detail → Cart → Checkout (native stack).

## Run the tests

From the **repository root**:

```bash
npm run test
```

This runs:

1. `bff` — Jest unit tests (`jest --forceExit` to avoid open handles from the cart inactivity timer).
2. `mobile` — Jest with the **`react-native` preset** (not `jest-expo`, so it works reliably with npm workspaces hoisting).

### BFF integration-style e2e (optional)

```bash
cd bff
npm run test:e2e
```

## Discount engine (BFF)

**Where it lives:** seeds in `bff/src/discounts/seeds/discount.seed.ts`, rule shapes in `bff/src/discounts/domain/discount.types.ts`.

**Rule kinds:** bulk discount on a line (min quantity), percent off the order above a spend threshold, or a fixed £ off the order (fixed £ is implemented but **not** in the seed data).

**What’s seeded (all active):**

- Bulk snack — 15% off any line with 3+ of the same item.
- 10% off the order once the cart (after bulk discounts) is at least £30.
- 15% off the order once the cart is at least £40.

**API:** `GET /discounts` lists active rules only. `GET /discounts/:id` loads one; missing or inactive returns 404.

**How prices are calculated** (same logic on cart preview and checkout):

1. Apply the **bulk line** rule first (if present), using the first matching rule in the seed file.
2. Apply **one** order-level rule: only the **highest spend band** that still qualifies counts (e.g. at £40+ you get the £40 deal, not the £30 deal). If several rules share that band, the biggest saving wins; ties use seed order.

Discount amounts are **split across lines in proportion** to each line’s share of the subtotal so everything adds up.

## Data & assumptions

- **No database**: all product/discount seed data and cart state are **in-memory** in the BFF process. Restarting the BFF resets catalogue stock to seed values and wipes carts.
- **Stock reservations**: quantity in a cart reserves units. `availableStock` on product APIs means “units not already reserved by **any** cart.”
- **Cart inactivity**: if there is **no cart activity for 2 minutes** (no successful call that **bumps** `lastActivityAt`—including `GET /carts/:id`, which **refreshes** the timer), a background sweep **deletes the cart server-side** and **releases** its reservations. **`GET /carts/:id/status`** returns the same snapshot but **does not** refresh the timer, so the app can poll it (about every 10s + when returning to foreground) and treat **410** as “expired” without keeping the session alive. Any **410** on a normal cart fetch triggers the same recovery: start a new cart and surface the message to the user.
- **Checkout failure** (e.g. stock no longer sufficient): the BFF **releases** that cart’s reservations and removes the cart; the app starts a fresh cart and shows the error message from the API.
- **No auth** (per exercise brief).

## TypeScript note (mobile)

Expo/React Native builds use Metro + Babel. Running `npx tsc --noEmit` inside `mobile` may report JSX typing friction between **React 19** and **React Native host components** (`Text`, `View`, etc.) until typings fully align upstream. The app is written in TypeScript and validated by the bundler; Jest tests compile via `babel-preset-expo`.
