<br/>
<p align="center">
  <a href="https://github.com/ghanim01/forevoapp">
    <img src="./src/assets/forevoLogo.png" alt="Logo" width="200">
  </a>

  <h3 align="center">A simple vuejs single page app to get news, weather and soccer results
</h3>
</p>

## Demo

- [Live Demo](https://forevoapp.vercel.app/)

<br />

## Screenshot

![](./src/assets/screenShot.png)

<br />

## Tech Stack

- [Vue.js 3](https://vuejs.org/)
- [Vuetify 3.0](https://next.vuetifyjs.com/en/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)
- [Vue Router](https://router.vuejs.org/)

## API's Used

- [Football-data.org](https://www.football-data.org/)
- [World News API](https://worldnewsapi.com/) - Supports 210+ countries & 86+ languages
- [OpenWeather](https://openweathermap.org/)
- [Cities.JSON](https://github.com/lutangar/cities.json)

## Installation and Build

#### - Clone the repo

```sh
    git clone https://github.com/ghanim01/forevoapp.git
```

#### - Install NPM packages

```sh
    npm install
```

#### - Set up environment variables

Create a `.env` file in the project root with the following variables:

```
VITE_APP_ID=your_openweather_api_key
VITE_WORLD_NEWS_API_KEY=your_world_news_api_key
VITE_SOCCER_TOKEN=your_football_data_token
VITE_VERCEL_ENV=production
```

**Get your API keys:**

- OpenWeather: https://openweathermap.org/api
- World News API: https://worldnewsapi.com/console/ (Free tier: 1,550 requests/month, supports 210+ countries)
- Football-Data.org: https://www.football-data.org/client/register

**For Vercel deployment:** Add the same environment variables (`VITE_APP_ID`, `VITE_WORLD_NEWS_API_KEY`, `VITE_SOCCER_TOKEN`, `VITE_VERCEL_ENV`) in your Vercel project settings under **Environment Variables**.

#### - Install Vercel CLI globally (required for local development)

```sh
    npm install -g vercel
```

#### - Run project for development

```sh
    npm run dev
```

This runs `vercel dev` which starts the Vite dev server and the serverless API functions locally.

> **Note:** The `vercel dev` command automatically proxies `/api/*` requests to your local serverless functions, so you can test the full application locally with API key security.

#### - Build the project

```sh
    npm run build
```

## Authors

- [Ahmed Ghanem](https://github.com/ghanim01/)

## License

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
