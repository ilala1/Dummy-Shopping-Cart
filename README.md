# Dummy-Shopping-Cart

Demo retail shopping flow: a **NestJS Backend-for-Frontend (BFF)** plus an **Expo (React Native)** customer app. Carts, stock reservations, discount preview, and checkout run against an in-memory API (no database).

## Repository layout

| Path | Description |
|------|-------------|
| `bff/` | NestJS BFF — products, discounts, carts, checkout |
| `mobile/` | Expo app — catalogue, cart, checkout (TypeScript, React Navigation) |

Root `package.json` uses **npm workspaces** for `bff` and `mobile`.

## Prerequisites

- **Node.js** 20+
- **npm** 9+
- **iOS:** Xcode (App Store) for the simulator

## Quick start

Install dependencies from the repository root:

```bash
npm install
```

**1. Run the BFF** (default: `http://127.0.0.1:3000`):

```bash
cd bff
npm run start:dev
```

**2. Run the mobile app** (with the BFF already running):

```bash
cd mobile
npm install
npm run start
```

Then open the project in the iOS Simulator, Android Emulator, or Expo Go.

The app picks a default BFF URL per platform; you can override it when starting Expo, for example:

```bash
EXPO_PUBLIC_BFF_URL=http://192.168.1.10:3000 npm run start
```

See `mobile/src/config/env.ts` for simulator vs emulator defaults.

## Tests

From the repository root:

```bash
npm run test
```

Runs Jest in `bff` and `mobile`.

## Further documentation

**[SOLUTION.md](./SOLUTION.md)** — API summary, discount engine, data assumptions, mobile architecture, optional BFF e2e tests, and TypeScript notes for the mobile app.
