import { ref } from "vue";
import { defineStore } from "pinia";
import cities from "cities.json";
import _ from "lodash";
import axios from "axios";

interface WeatherData {
  temp: number;
  city: string;
  windSpeed: string | number;
  windDeg: string | number;
  humidity: string | number;
  clouds: string | number;
  xicon: string;
  description: string;
  feels_like: string | number;
  temp_min: string | number;
  temp_max: string | number;
  date: string;
  sunrise: string;
  sunset: string;
  condition: string;
}

interface CityData {
  name: string;
  country: string;
  lat: string | number;
  lng: string | number;
}

interface OpenWeatherResponse {
  dt: number;
  sys: {
    sunrise: number;
    sunset: number;
  };
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  wind: {
    speed: number | string;
    deg: number | string;
  };
  clouds: {
    all: number | string;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  name: string;
}

export const useWeatherStore = defineStore("weatherStore", {
  state: () => ({
    searchresponseult: {
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
    cityresponseult: ref<CityData | null>(null),
    isLoading: false,
  }),
  getters: {
    getSearchInput(): WeatherData {
      return this.searchresponseult;
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
      this.cityresponseult = (cities as any[])[x];
      this.searchresponseult.city = (this.cityresponseult as CityData).name;
      this.searchWeather();
    },
    async searchWeather() {
      this.isLoading = true;
      try {
        const cityData = this.cityresponseult as CityData | null;
        if (!cityData) {
          console.error("No city selected");
          return;
        }

        const response = await axios.get("/api/weather", {
          params: {
            lat: cityData.lat,
            lon: cityData.lng,
            units: "metric",
          },
        });

        if (!response.data || !response.data.sys || !response.data.main) {
          console.error("Invalid weather response format");
          return;
        }

        const datetime = new Date(response.data.dt * 1000);
        const sunrise = new Date(response.data.sys.sunrise * 1000);
        const sunset = new Date(response.data.sys.sunset * 1000);

        const formattedDate = datetime.toLocaleString();
        const formattedSunrise = sunrise.toLocaleTimeString();
        const formattedSunset = sunset.toLocaleTimeString();

        this.searchresponseult.date = formattedDate;
        this.searchresponseult.sunrise = formattedSunrise;
        this.searchresponseult.sunset = formattedSunset;
        this.searchresponseult.temp = response.data.main.temp;
        this.searchresponseult.humidity = response.data.main.humidity;
        this.searchresponseult.windSpeed = response.data.wind.speed;
        this.searchresponseult.windDeg = response.data.wind.deg;
        this.searchresponseult.clouds = response.data.clouds.all;
        this.searchresponseult.condition = response.data.weather[0].main;
        this.searchresponseult.xicon = response.data.weather[0].icon;
        this.searchresponseult.description = response.data.weather[0].description;
        this.searchresponseult.feels_like = response.data.main.feels_like;
        this.searchresponseult.temp_max = response.data.main.temp_max;
        this.searchresponseult.temp_min = response.data.main.temp_min;
        this.searchresponseult.city = response.data.name;
      } catch (error) {
        console.error("Weather API error:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
