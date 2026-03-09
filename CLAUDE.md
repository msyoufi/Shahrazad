# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shahrazad is an Angular portfolio/gallery application for an artist. It has a public-facing gallery and an admin dashboard for managing paintings and profile data. Backend is Firebase (Firestore, Auth, Storage).

## Commands

- `ng serve` — Dev server at localhost:4200
- `ng build` — Production build
- `ng test` — Run tests (Karma/Jasmine)

## Architecture

**Framework:** Angular 20 with standalone components, Angular Signals for state, Angular Material for UI.

**Component prefix:** `shari-`

**Routing (`app.routes.ts`):**
- `/` — Home (public gallery)
- `/painting/:id` — Painting details (public)
- `/about` — About page (public)
- `/login-1975` — Admin login (lazy loaded, guarded)
- `/dashboard-1975` — Admin dashboard (lazy loaded, auth-protected)
  - Child routes: `paintings`, `painting/:id`, `profile`, `security`

**Key services (`src/app/shared/services/`):**
- `auth.ts` — Firebase Auth, exposes `currentUser` signal, guards routes via `auth.guard.ts`
- `paintings.ts` — Real-time Firestore listener, exposes `paintings` signal, CRUD + batch order updates
- `profile.ts` — Real-time profile document listener, manages studio shots with image compression
- `image-storage.ts` — Compresses images to two sizes (large: 1MB/3000px, thumbnail: 0.02MB/800px), uploads to Firebase Storage

**State management:** Angular Signals in services act as centralized state containers. Firestore `onSnapshot()` provides real-time updates.

**Firebase config:** Imported from `src/secrets/firebase.config` (gitignored — must be created locally).

**Firestore collections:** `paintings/` for artwork, `profile/shahrazad` for profile data.

## Styling

- SCSS with CSS custom properties for theming (primary: `#5d1bd8` purple)
- Global styles in `src/app/shared/styles/` (general, inputs, dashboard) imported via `index.scss`
- Mobile breakpoint: 550px
- Inline style language: SCSS

## Types

- `src/types/painting.d.ts` — Painting interface (includes `is_soled` for sold status, `ImageUrls` for large/thumbnail pairs)
- `src/types/app.d.ts` — Profile, StudioShotUrl interfaces
