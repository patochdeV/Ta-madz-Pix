# Tama Pix Codes

## Overview

Tama Pix Codes is a mobile-first application built with Expo/React Native that serves as a catalog and QR code viewer for Tamagotchi Pix items. Users can browse items organized by categories (meals, snacks, items, accessories, furniture, rooms, and special), search through them, mark favorites, and view QR codes that can be scanned by a Tamagotchi Pix device. The app features a cute, pastel-colored UI with haptic feedback and smooth animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend (Expo/React Native)

- **Framework**: Expo SDK 54 with React Native 0.81, using the new architecture (`newArchEnabled: true`)
- **Routing**: File-based routing via `expo-router` v6 with typed routes. Routes are defined by file structure under `app/`:
  - `app/index.tsx` — Home screen with category grid
  - `app/category/[id].tsx` — Category detail with item list
  - `app/item/[id].tsx` — Item detail modal showing sprite and QR code
  - `app/favorites.tsx` — Favorites list
  - `app/search.tsx` — Search screen
- **State Management**: React Context (`FavoritesContext`) for favorites, persisted to `AsyncStorage`. React Query (`@tanstack/react-query`) is set up for server data fetching but currently the app uses static local data.
- **Data Source**: All Tamagotchi item data is hardcoded in `data/tamagotchi-items.ts` as a static array. Sprites and QR codes are loaded from `mrblinky.net` URLs. There is no dynamic data fetching from the backend for item content.
- **UI Libraries**: `expo-linear-gradient`, `expo-image`, `react-native-reanimated` (animations), `expo-haptics`, `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`
- **Fonts**: Nunito (Regular, SemiBold, Bold, ExtraBold) via `@expo-google-fonts/nunito`
- **Styling**: Plain `StyleSheet.create()` with a centralized color palette in `constants/colors.ts`. The design uses pastel gradients and rounded cards.

### Backend (Express)

- **Framework**: Express 5 running on Node.js, served from `server/index.ts`
- **Purpose**: Minimal backend. Currently has no meaningful API routes — `server/routes.ts` creates an HTTP server but registers no endpoints. The server primarily serves the static web build in production and handles CORS for development.
- **Storage**: `server/storage.ts` implements a `MemStorage` class (in-memory Map) with basic user CRUD. This is a scaffold — not actively used by the frontend.
- **CORS**: Configured to allow Replit dev/deployment domains and localhost origins for Expo web development.
- **Production**: In production, the server serves a static Expo web build from a `dist/` folder. A custom build script (`scripts/build.js`) handles bundling the Expo web app via Metro.

### Database Schema (Drizzle + PostgreSQL)

- **ORM**: Drizzle ORM with PostgreSQL dialect, configured in `drizzle.config.ts`
- **Schema**: Defined in `shared/schema.ts` — currently only a `users` table with `id` (UUID), `username`, and `password`. This is scaffolding and not actively used by the app.
- **Migrations**: Output to `./migrations` directory. Push with `npm run db:push`.
- **Validation**: `drizzle-zod` generates Zod schemas from Drizzle table definitions.

### Build & Development

- **Development**: Two processes run in parallel:
  - `npm run expo:dev` — Starts Expo Metro bundler for the mobile/web app
  - `npm run server:dev` — Starts the Express backend with `tsx`
- **Production Build**: 
  - `npm run expo:static:build` — Builds static web bundle via custom script
  - `npm run server:build` — Bundles server with esbuild to `server_dist/`
  - `npm run server:prod` — Runs production server
- **Platform Support**: iOS, Android, and Web. The app adapts UI for web (e.g., different top insets, keyboard handling).

### Key Design Patterns

- **Path Aliases**: `@/*` maps to project root, `@shared/*` maps to `./shared/*`
- **Error Handling**: Custom `ErrorBoundary` class component wrapping the app, with an `ErrorFallback` component that offers restart functionality
- **Favorites Persistence**: Simple pattern — React Context + AsyncStorage, no server sync
- **Static Data Architecture**: Item data is embedded in the client bundle rather than fetched from an API. This makes the app work offline but means updates require a new build.

## External Dependencies

- **PostgreSQL**: Database configured via `DATABASE_URL` environment variable. Required for Drizzle but not actively used by the current app logic.
- **Tamagotchi Assets (mrblinky.net)**: All item sprites and QR code images are hosted externally at `http://mrblinky.net/tama/pix/download/`. The app depends on this third-party server being available for images to load.
- **AsyncStorage**: Local device storage for persisting favorites across sessions.
- **Expo Services**: Standard Expo build and development toolchain. Uses `expo-splash-screen`, `expo-font`, `expo-web-browser` plugins.
- **Replit Environment**: The app is designed to run on Replit, using environment variables like `REPLIT_DEV_DOMAIN`, `REPLIT_DOMAINS`, and `REPLIT_INTERNAL_APP_DOMAIN` for URL configuration and CORS.