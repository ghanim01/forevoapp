# Copilot Instructions for ForevoApp

## Architecture Overview

Vue 3 SPA providing weather, news, and soccer data using a secure serverless API proxy pattern:

```
src/components/* → src/stores/* → /api/* (Vercel serverless) → External APIs
```

**Key principle**: All external API calls go through Vercel serverless functions in `api/` to keep API keys secure. Frontend stores call `/api/*` endpoints, never external APIs directly.

## Project Stack

- **Frontend**: Vue 3 (Composition API in components, Options API in stores), Vuetify 4, Pinia
- **Backend**: Vercel serverless functions (`api/*.ts`) using `@vercel/node`
- **Build**: Vite with manual chunk splitting for vuetify, vue, and vendor bundles

## Development Commands

```bash
npm run dev           # Start Vite dev server only (no serverless functions)
npm run dev:vercel    # Start with Vercel dev server (includes /api/* endpoints)
vercel dev            # Same as above - required for full local testing
npm run test:unit     # Vitest unit tests with jsdom
```

**Important**: Use `vercel dev` for local development to test API integrations. Plain `npm run dev` won't proxy `/api/*` requests.

## CI/CD

- **Hosting**: Vercel (auto-deploys from GitHub `main` branch)
- **Deployment**: Push to `main` triggers automatic build and deploy
- **Preview**: Pull requests get automatic preview deployments
- **Environment**: Set env vars in Vercel dashboard for production

## Code Patterns

### Pinia Stores (`src/stores/`)
Stores are defined with the Options API inside `defineStore` and strongly typed using shared interfaces from `src/types/index.ts`.
- All stores expose getters for read-only access and actions that mutate state and perform API calls via axios.
- State often includes a private `_abortController` so requests can be cancelled when a user initiates a new search.

**Weather store** adds robust retry/backoff and abort behavior:
```ts
// cancel previous flight before starting
if (this._abortController) this._abortController.abort();
this._abortController = new AbortController();
const signal = this._abortController.signal;

// retry loop with exponential backoff (1s,2s,4s)
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try { /* axios.get('/api/weather', { params, timeout:8000, signal }) */ }
  catch(err){ /* handle CanceledError specially; else wait and retry */ }
}
```

**News store** adds local‑storage caching and in‑flight cancellation. Trending articles are cached for 6 hours by default; `fetchNews(true)` forces a refresh.

**Soccer store** duplicates logic for multiple competitions (Premier League, Champions League, La Liga) and provides `filterByLatestMatchday()` helper so views only show the most recent round.

### Search / UI wiring
The `<AppHeader.vue>` component contains the city search box and quick‑city buttons. It imports `cities.json` and performs in‑memory filtering to provide suggestions (search term length &gt;=2) and populates `selectedCity`:
```ts
const filteredCities = computed(() => { /* regex over cities.json */ });

const selectCity = city => {
  weatherStore.searchCityByObject(city);
};
```
A watcher on `weatherStore.isLoading` clears the input once a search finishes. On mount the header triggers initial data loads for weather and all soccer competitions.

### Store state conventions
- `selectedCity` – current search target (weather store only)
- API results: `weatherResult`, `newsSearchResult`, `soccerResults`, etc.
- Loading flags are either `isLoading` or `loading`; clear them in `finally` blocks.
- `error` strings are set on failure and reset at start of actions.

### Serverless API Functions (`api/`)
All endpoints are plain TypeScript under `api/` and use `@vercel/node`.
1. Extract and validate `req.query` params; return `400` when required fields are missing.
2. Resolve API key via `process.env.VITE_*` or fallback name (e.g. `VITE_APP_ID || OPENWEATHER_API_KEY`).
3. Use axios to call the external service, forward any query parameters, and return the JSON result or an error status.

Example snippet from `api/weather.ts`:
```ts
const apiKey = process.env.VITE_APP_ID || process.env.OPENWEATHER_API_KEY;
if (!apiKey) return res.status(500).json({ error: "API key not configured" });
```

### Component structure
Components live in `src/components/` and use `<script setup lang="ts">` with Composition API. Stores are accessed via `use*Store()`.
Views in `src/views/` are simple wrappers for components; only `HomeView.vue` exists currently.

## Environment Variables
Required in `.env` and defined in Vercel dashboard for production:
- `VITE_APP_ID` (OpenWeather) – also checked via `OPENWEATHER_API_KEY` fallback
- `VITE_GNEWS_API_KEY` (gnews.io)
- `VITE_SOCCER_TOKEN` (football-data.org)
- `VITE_VERCEL_ENV` – set to `production` during deployment

## External APIs
| Service | Endpoint Proxied | API Function |
|---------|------------------|--------------|
| OpenWeather | `/api/weather` | `api/weather.ts` |
| GNews (gnews.io) | `/api/news` | `api/news.ts` (retry + backoff + cache) |
| Football-Data.org | `/api/soccer` | `api/soccer.ts` |

## Build & Development Commands
```bash
npm run dev           # Vite dev server only (no serverless)
npm run dev:vercel    # Vercel dev (proxies /api/* locally)
vercel dev            # interchangeable with npm run dev:vercel
npm run build         # production bundle
npm run preview       # serve built output
npm run test:unit     # Vitest (jsdom) -- no tests exist yet
npm run lint          # ESLint fixer
```
*Note*: `npm run dev` alone cannot reach `/api/*`; always use `vercel dev` when working with backend endpoints.

## Testing
Vitest is configured but the repository currently has no `.spec.ts` files. Place unit tests under `src/` alongside modules; the command above targets that directory.

## CI/CD
- Hosted on Vercel; pushes to `main` auto‑deploy.
- Pull requests trigger preview deployments.
- Set required env vars in Vercel dashboard.

## File Conventions
- **components**: `src/components/*.vue` – presentation/UI logic
- **stores**: `src/stores/*Store.ts` – Pinia state management
- **views**: `src/views/*View.vue` – page containers
- **api**: serverless functions matching `/api/*` (lowercase filenames)
- **types**: shared TypeScript interfaces used across stores/components

> Keep API calls within stores; components should not call external services directly.


