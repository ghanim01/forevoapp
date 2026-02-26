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
- [News API](https://newsapi.org/)
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

Create a `.env.local` file in the project root with the following variables (used by Vite dev proxy and Vercel serverless functions):

```
APP_ID=your_openweather_api_key
NEWS_API_KEY=your_newsapi_key
SOCCER_TOKEN=your_football_data_token
```

When deploying to Vercel, add the same variables (`APP_ID`, `NEWS_API_KEY`, `SOCCER_TOKEN`) in the Vercel project settings under **Environment Variables**.

#### - Run project for development

```sh
    npm run dev
```

> **Note:** For full local development including serverless functions, use the [Vercel CLI](https://vercel.com/docs/cli): `vercel dev`

#### - Build the project

```sh
    npm run build
```

## Authors

- [Ahmed Ghanem](https://github.com/ghanim01/)

## License

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
