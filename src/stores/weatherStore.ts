import { defineStore } from "pinia";
import cities from "cities.json";
import _ from "lodash";
import axios from "axios";
import type { CityData, WeatherData } from "../types";

export const useWeatherStore = defineStore("weatherStore", {
  state: () => ({
    weatherResult: {
      temp: 0,
      city: "",
      windSpeed: "",
      windDeg: "",
      humidity: "",
      clouds: "",
      xicon: "04n",
      description: "",
      feels_like: "",
      temp_min: "",
      temp_max: "",
      date: "",
      sunrise: "",
      sunset: "",
      condition: "",
    } as WeatherData,
    selectedCity: null as CityData | null,
    isLoading: false,
    error: null as string | null,
    _abortController: null as AbortController | null,
  }),
  getters: {
    getSearchInput(): WeatherData {
      return this.weatherResult;
    },
  },
  actions: {
    searchCityName(city: string) {
      const z = city.toLocaleLowerCase().trim();
      const y = z[0].toUpperCase() + z.slice(1);
      const x = _.findIndex(cities as any[], function (o: any) {
        return o.name === y;
      });
      if (x === -1) {
        console.error("City not found:", city);
        return;
      }
      this.selectedCity = (cities as any[])[x];
      this.weatherResult.city = (this.selectedCity as CityData).name;
      this.searchWeather();
    },
    searchCityByObject(city: CityData) {
      this.selectedCity = city;
      this.weatherResult.city = city.name;
      this.searchWeather();
    },
    async searchWeather() {
      // Cancel any in-flight request
      if (this._abortController) {
        this._abortController.abort();
      }
      this._abortController = new AbortController();
      const signal = this._abortController.signal;

      this.isLoading = true;
      this.error = null;
      
      try {
        const maxRetries = 3;
        let lastError: any = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const cityData = this.selectedCity;
            if (!cityData) {
              this.error = "No city selected";
              return;
            }

            const response = await axios.get("/api/weather", {
              params: {
                lat: cityData.lat,
                lon: cityData.lng,
                units: "metric",
              },
              timeout: 8000,
              signal,
            });

            if (!response.data || !response.data.sys || !response.data.main) {
              this.error = "Invalid weather data received";
              return;
            }

            const datetime = new Date(response.data.dt * 1000);
            const sunrise = new Date(response.data.sys.sunrise * 1000);
            const sunset = new Date(response.data.sys.sunset * 1000);

            this.weatherResult.date = datetime.toLocaleString();
            this.weatherResult.sunrise = sunrise.toLocaleTimeString();
            this.weatherResult.sunset = sunset.toLocaleTimeString();
            this.weatherResult.temp = response.data.main.temp;
            this.weatherResult.humidity = response.data.main.humidity;
            this.weatherResult.windSpeed = response.data.wind.speed;
            this.weatherResult.windDeg = response.data.wind.deg;
            this.weatherResult.clouds = response.data.clouds.all;
            this.weatherResult.condition = response.data.weather[0].main;
            this.weatherResult.xicon = response.data.weather[0].icon;
            this.weatherResult.description = response.data.weather[0].description;
            this.weatherResult.feels_like = response.data.main.feels_like;
            this.weatherResult.temp_max = response.data.main.temp_max;
            this.weatherResult.temp_min = response.data.main.temp_min;
            this.weatherResult.city = response.data.name;
            
            // Success - exit retry loop
            return;
          } catch (err: any) {
            lastError = err;
            if (err.name === "CanceledError" || err.code === "ERR_CANCELED") {
              // Don't retry if request was canceled
              return;
            }

            console.error(`Weather API error (attempt ${attempt}/${maxRetries}):`, err);

            // If this is not the last attempt, wait before retrying
            if (attempt < maxRetries) {
              // Exponential backoff: 1s, 2s, 4s
              const delayMs = Math.pow(2, attempt - 1) * 1000;
              await new Promise(resolve => setTimeout(resolve, delayMs));
            }
          }
        }

        // All retries failed
        if (lastError) {
          console.error("Weather API error after all retries:", lastError);
          this.error = "Failed to load weather data. Please try again.";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
});
