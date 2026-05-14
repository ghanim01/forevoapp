<div align="center">
  <img src="./src/assets/forevoLogo.svg" alt="Forevo" width="180" />

  <p><strong>Weather · Soccer · News — one dashboard</strong></p>

  <p>
    <a href="https://forevoapp.vercel.app/" target="_blank">
      <img src="https://img.shields.io/badge/demo-live-22D3EE?style=flat-square&logo=vercel" alt="Live Demo" />
    </a>
    <img src="https://img.shields.io/github/license/ghanim01/forevoapp?style=flat-square&color=22D3EE" alt="MIT License" />
    <img src="https://img.shields.io/github/last-commit/ghanim01/forevoapp?style=flat-square&color=6B21A8" alt="Last Commit" />
    <img src="https://img.shields.io/badge/vue-3-4FC08D?style=flat-square&logo=vue.js" alt="Vue 3" />
    <img src="https://img.shields.io/badge/vuetify-4-1867C0?style=flat-square&logo=vuetify" alt="Vuetify 4" />
  </p>


</div>

---

## ✨ Overview

**Forevo** is a real-time dashboard that brings together **live weather**, **soccer scores**, and **regional news** in a sleek, dark-themed interface.

Three data sources, one clean view — built with Vue 3, powered by Vercel serverless functions, and designed for both desktop and mobile.

---

## 🚀 Features

| | |
|---|---|
| 🌤️ **Live Weather** | Temperature, humidity, wind, sunrise/sunset — with dynamic gradient backgrounds based on conditions. Search any city or pick from quick-select chips. |
| ⚽ **Soccer Scores** | Premier League, Champions League, and La Liga latest matchday results. Filter between competitions with live status badges. |
| 📰 **Regional News** | Middle East headlines via GNews API with smart caching (6-hour localStorage), background refresh, and manual refresh control. |
| 📱 **Responsive** | Three layouts — desktop (two-column), tablet (stacked), mobile (bottom-tab carousel with animated transitions). |
| 🌙 **Dark Mode** | Full dark theme with glassmorphism cards, ambient glow orbs, and temperature-aware weather gradients. |
| 🔒 **API Key Security** | All third-party API calls go through Vercel serverless functions — keys never reach the client. |

---

## 🛠️ Tech Stack

<div align="center">

`Vue 3` · `Vuetify 4` · `Pinia` · `Vue Router` · `TypeScript` · `Vite` · `Axios` · `Vercel`

</div>

| **Frontend** | **Backend** | **APIs** |
|---|---|---|
| [Vue 3](https://vuejs.org/) + Composition API | [Vercel Serverless Functions](https://vercel.com/docs/functions) | [OpenWeather](https://openweathermap.org/) |
| [Vuetify 4](https://vuetifyjs.com/) (dark theme) | Node.js + TypeScript | [Football-Data.org](https://www.football-data.org/) |
| [Pinia](https://pinia.vuejs.org/) state management | API gateway pattern (keys stay server-side) | [GNews](https://gnews.io/) |
| [Vue Router](https://router.vuejs.org/) (hash-free) | Retry with exponential backoff | — |
| [Vite](https://vitejs.dev/) (blazing fast builds) | Response caching via `Cache-Control` headers | — |

---

## ⚡ Quick Start

```bash
# 1. Clone
git clone https://github.com/ghanim01/forevoapp.git && cd forevoapp

# 2. Install
npm install

# 3. Get API keys from:
#    • https://openweathermap.org/api
#    • https://gnews.io/register
#    • https://www.football-data.org/client/register

# 4. Set environment variables
cp .env.example .env
# Then edit .env with your keys

# 5. Install Vercel CLI (for local API proxy)
npm install -g vercel

# 6. Run (starts Vite + serverless functions)
npm run dev
```

> **Note:** The `vercel dev` command automatically proxies `/api/*` requests to your local serverless functions, keeping API keys secure during development.

### Production Build

```bash
npm run build   # outputs to dist/
```

### Vercel Deployment

Add these environment variables in your Vercel project settings:

```
OPENWEATHER_API_KEY
GNEWS_API_KEY
SOCCER_API_TOKEN
```

---

## 🏗️ Project Structure

```
src/
├── api/            # Shared Axios instance
├── components/     # UI components (Weather, Soccer, News, Header, MatchCard)
├── composables/    # Reusable Vue composables (useBreakpoint)
├── stores/         # Pinia stores (weather, soccer, news)
├── utils/          # Utilities (lazy-loaded cities search)
├── views/          # Page views (HomeView)
├── types/          # TypeScript interfaces
├── plugins/        # Vuetify config
├── router/         # Vue Router setup
└── App.vue         # Root component

api/                # Vercel serverless functions (weather, soccer, news)
```

---

## 📊 Architecture Highlights

| Pattern | Implementation |
|---|---|
| **API Gateway** | All external calls proxied through Vercel serverless functions — keys stay server-side |
| **Smart Caching** | News articles cached in `localStorage` for 6h with 2h background refresh |
| **Lazy Loading** | `cities.json` (69MB) dynamically imported only on user search |
| **Error Isolation** | Per-competition error states for soccer (PL/CL/La Liga don't interfere) |
| **Retry Logic** | Exponential backoff (1s → 2s → 4s) for transient API failures |
| **Abort Control** | `AbortController` cancels stale requests on rapid city switching |
| **Code Splitting** | Manual Vite chunks separate Vuetify, Vue core, and vendor libs |

---

<div align="center">
  <sub>Built by <a href="https://github.com/ghanim01">Ahmed Ghanem</a> · MIT License · 2025</sub>
</div>
