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

Seed rules live in `bff/src/discounts/seeds/discount.seed.ts`. Types are documented in `bff/src/discounts/domain/discount.types.ts`.

Applied **automatically at checkout** (and mirrored in cart totals) in this order:

1. **LINE_QTY_PERCENT** — “Bulk snack deal”: 15% off any line with quantity ≥ 3 (applied per eligible line).
2. **FIXED_CENTS** — “£5 off £40+” when subtotal (after line discounts) meets the threshold.
3. **PERCENT_OFF** — “10% off £30+” on the remaining subtotal after the fixed step.

Discount reductions are allocated across lines pro-rata so line totals reconcile to the order total.

## Data & assumptions

- **No database**: all product/discount seed data and cart state are **in-memory** in the BFF process. Restarting the BFF resets catalogue stock to seed values and wipes carts.
- **Stock reservations**: quantity in a cart reserves units. `availableStock` on product APIs means “units not already reserved by **any** cart.”
- **Cart inactivity**: if there is **no cart activity for 2 minutes** (no successful mutating cart API call), a background sweep **deletes the cart server-side** and **releases** its reservations. The mobile client treats a subsequent **410** on `GET /carts/:id` as “expired” and starts a new cart.
- **Checkout failure** (e.g. stock no longer sufficient): the BFF **releases** that cart’s reservations and removes the cart; the app starts a fresh cart and shows the error message from the API.
- **No auth** (per exercise brief).

## TypeScript note (mobile)

Expo/React Native builds use Metro + Babel. Running `npx tsc --noEmit` inside `mobile` may report JSX typing friction between **React 19** and **React Native host components** (`Text`, `View`, etc.) until typings fully align upstream. The app is written in TypeScript and validated by the bundler; Jest tests compile via `babel-preset-expo`.
