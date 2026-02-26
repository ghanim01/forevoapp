# ForevoApp Roadmap

## Current State (Feb 2026)

**Completed:**
- [x] Secure API proxy via Vercel serverless functions (`api/*.ts`)
- [x] Vue 3 + Vuetify 4 + Pinia architecture
- [x] Consistent naming conventions across stores
- [x] CI/CD via GitHub → Vercel auto-deploy
- [x] Migrated news API from World News API (50 req/day) to GNews (100 req/day)

**Active Issues:**
- No unit tests despite Vitest configuration
- Commented-out code in components (carousel in newsComponent, autocomplete in navBar)
- Duplicated match card template in soccerResults.vue
- RTL styling hack in newsComponent.vue
- No error UI states (only console.error)

---

## Phase 1: Design Overhaul (Modern & Clean)

### 1.1 Layout Restructure
- [ ] **Dashboard grid layout** - Replace current row/col with CSS Grid for weather/news/soccer sections
- [ ] **Glassmorphism cards** - Semi-transparent backgrounds with blur effects
- [ ] **Consistent spacing system** - Use Vuetify's spacing scale (`ma-4`, `pa-6`) uniformly

### 1.2 Weather Component Redesign
```
Current: Dense list items with plain text
Target:  Visual weather card with:
         - Large animated weather icon (Lottie or CSS)
         - Gradient background based on condition (sunny=warm, rain=cool)
         - Horizontal stat pills for humidity/wind/etc
         - Mini hourly forecast bar (future API addition)
```

### 1.3 News Component Modernization
- [ ] **Card-based grid** - 2-3 column masonry layout instead of full-width cards
- [ ] **Image-first design** - Larger hero images with overlay text
- [ ] **Category badges** - Color-coded tags for news categories
- [ ] **Remove RTL hack** - Use proper Vuetify `dir` prop or CSS logical properties

### 1.4 Soccer Results Revamp
- [ ] **Extract reusable `MatchCard.vue`** - Eliminate duplicate template code
- [ ] **Competition tabs** - Tab interface for PL/CL instead of stacked sections
- [ ] **Live match indicator** - Pulsing badge for in-progress matches
- [ ] **Score animation** - Subtle number transition on updates

### 1.5 Navigation & Search
- [ ] **Floating search bar** - Center-aligned with suggestions dropdown
- [ ] **City autocomplete** - Re-enable commented autocomplete with cities.json
- [ ] **Quick location buttons** - Popular cities chips below search
- [ ] **Theme toggle** - Light/dark mode switch

---

## Phase 2: Clean Code & Architecture

### 2.1 Component Refactoring
| File | Issue | Action |
|------|-------|--------|
| `soccerResults.vue` | Duplicate match card template | Extract `MatchCard.vue` component |
| `newsComponent.vue` | Commented carousel code | Remove or implement properly |
| `navBar.vue` | Commented autocomplete | Implement or remove |
| All components | Inline styles | Move to scoped CSS or Vuetify classes |

### 2.2 Store Improvements
- [ ] **Shared CityData type** - Create `src/types/index.ts` for shared interfaces
- [ ] **Error state handling** - Add `error: string | null` to all stores
- [ ] **Computed getters simplification** - Remove redundant getters that just return state

### 2.3 API Layer
- [ ] **Response caching** - Add `stale-while-revalidate` headers in serverless functions
- [ ] **Request deduplication** - Prevent duplicate API calls on rapid searches
- [ ] **Typed API responses** - Share types between `api/*.ts` and stores

### 2.4 Testing Setup
- [ ] **Store unit tests** - Test Pinia actions with mocked axios
- [ ] **Component tests** - Mount tests for key user interactions
- [ ] **API integration tests** - Test serverless functions locally

---

## Phase 3: Workflow & DevEx

### 3.1 Development Workflow
- [ ] **Pre-commit hooks** - Husky + lint-staged for formatting
- [ ] **PR template** - Checklist for code review
- [ ] **GitHub Actions** - Run tests on PR, type-check on push

### 3.2 Error Handling UX
- [ ] **Toast notifications** - Vuetify snackbar for API errors
- [ ] **Empty states** - Illustrated placeholders when no data
- [ ] **Retry buttons** - Allow users to retry failed requests
- [ ] **Offline indicator** - Show when network is unavailable

### 3.3 Performance
- [ ] **Lazy load components** - Dynamic imports for below-fold content
- [ ] **Image optimization** - Use `loading="lazy"` and WebP where possible
- [ ] **Bundle analysis** - Review chunk sizes, consider splitting cities.json

---

## Phase 4: New Features

### 4.1 Weather Enhancements
- [ ] **5-day forecast** - Add OpenWeather forecast endpoint to `api/weather.ts`
- [ ] **Weather alerts** - Show severe weather warnings
- [ ] **Unit toggle** - Celsius/Fahrenheit switch with localStorage persistence
- [ ] **Geolocation** - "Use my location" button

### 4.2 News Enhancements
- [ ] **Category filter** - Filter news by sports/politics/tech/etc (GNews supports: general, world, nation, business, technology, entertainment, sports, science, health)
- [ ] **Pagination** - Load more articles using GNews `page` param
- [ ] **Bookmark articles** - Save to localStorage
- [ ] **Share buttons** - Copy link, share to social

### 4.3 Soccer Enhancements
- [ ] **League selector** - Add more competitions (La Liga, Serie A, Bundesliga)
- [ ] **Standings table** - Show league table alongside matches
- [ ] **Upcoming matches** - Toggle between finished/scheduled
- [ ] **Team details** - Click team to see recent form

### 4.4 Personalization
- [ ] **User preferences** - Save default city, preferred leagues, news categories
- [ ] **Dashboard customization** - Drag-and-drop widget reordering
- [ ] **PWA support** - Add manifest.json and service worker for installability

---

## Implementation Priority

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 🔴 High | Extract MatchCard.vue | 1h | Code quality |
| 🔴 High | Error state UI | 2h | User experience |
| 🟡 Medium | Weather card redesign | 4h | Visual appeal |
| 🟡 Medium | News grid layout | 3h | Visual appeal |
| 🟡 Medium | City autocomplete | 2h | Usability |
| 🟢 Low | 5-day forecast | 4h | Feature value |
| 🟢 Low | League selector | 3h | Feature value |
| 🟢 Low | PWA support | 4h | Accessibility |

---

## Design System (Proposed)

### Colors
```scss
$primary: #0D9488;      // Teal (current accent)
$surface: #1E1E1E;      // Dark card background
$surface-variant: #2D2D2D;
$on-surface: #E5E5E5;
$gradient-warm: linear-gradient(135deg, #F59E0B, #EF4444);
$gradient-cool: linear-gradient(135deg, #3B82F6, #8B5CF6);
```

### Typography
- Headlines: `Poppins` or `Inter` (modern sans-serif)
- Body: System font stack for performance

### Spacing Scale
- `xs`: 4px | `sm`: 8px | `md`: 16px | `lg`: 24px | `xl`: 32px

### Component Patterns
- Cards: 12px border-radius, subtle shadow, hover elevation
- Buttons: Rounded pill style, consistent padding
- Icons: Material Design Icons (already installed)