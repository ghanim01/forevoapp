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
Stores use Options API style with typed interfaces. City lookups use `cities.json`:

```typescript
// Pattern: City search → set store state → trigger API call
searchCityName(city: string) {
  const x = _.findIndex(cities as any[], (o) => o.name === capitalizedCity);
  this.selectedCity = cities[x];  // Store city data with lat/lng
  this.searchWeather();           // Trigger API call
}
```

### Store State Naming
- `selectedCity` - Current city selection (shared pattern across stores)
- `weatherResult` / `newsSearchResult` / `soccerResults` - API response data
- `isLoading` / `loading` - Loading state flags

### Serverless API Functions (`api/`)
All functions follow this pattern:
1. Extract query params from `req.query`
2. Validate required params, return 400 if missing
3. Get API key from `process.env` (supports both `VITE_*` and alternate names)
4. Call external API with axios
5. Return response or error status

```typescript
// api/weather.ts pattern
const apiKey = process.env.VITE_APP_ID || process.env.OPENWEATHER_API_KEY;
if (!apiKey) return res.status(500).json({ error: "API key not configured" });
```

### Component Structure
Components use `<script setup lang="ts">` with Composition API. Access stores via composables:

```typescript
const weatherStore = useWeatherStore();
const searchRes = computed(() => weatherStore.getSearchInput);
```

## Environment Variables

Required in `.env` and Vercel dashboard:
- `VITE_APP_ID` - OpenWeather API key
- `VITE_GNEWS_API_KEY` - GNews API key (gnews.io)  
- `VITE_SOCCER_TOKEN` - Football-data.org token
- `VITE_VERCEL_ENV` - Set to `production` for Vercel

## External APIs

| Service | Endpoint Proxied | API Function |
|---------|------------------|--------------|
| OpenWeather | `/api/weather` | `api/weather.ts` |
| GNews (gnews.io) | `/api/news` | `api/news.ts` (has retry logic with exponential backoff) |
| Football-Data.org | `/api/soccer` | `api/soccer.ts` |

## File Conventions

- Components: `src/components/*.vue` - PascalCase or camelCase naming
- Stores: `src/stores/*Store.ts` - Named exports with `use*Store` pattern
- Views: `src/views/*View.vue` - Page-level components
- API: `api/*.ts` - Lowercase, matches `/api/*` route
