import { ref } from "vue";
import { defineStore } from "pinia";
import cities from "cities.json";
import _ from "lodash";
import axios from "axios";

export const useNewsStore = defineStore("newsStore", {
  state: () => ({
    newsSearchResult: ref([]),
    cityresponseResult: ref(),
  }),
  getters: {
    getNewsResult: function () {
      return this.newsSearchResult;
    },
  },
  actions: {
    searchCity(city) {
      let z = [];
      z = city.toLocaleLowerCase().trim();
      let y = z[0].toUpperCase() + z.slice(1);
      const x = _.findIndex(cities, function (o) {
        return o.name == y;
      });
      this.cityresponseResult = cities[x];
      this.searchNews();
    },
    async searchNews() {
      const apiKEY = import.meta.env.VITE_API_KEY;
      let response = await axios.get(
        "https://newsapi.org/newsapi/v2/top-headlines",
        {
          headers: {
            "Access-Control-Allow-Origin": "https://newsapi.org/newsapi/v2",
          },
          params: {
            country: this.cityresponseResult.country,
            sortBy: "publishedAt",
            apiKey: apiKEY,
          },
        }
      );
      this.newsSearchResult = response.data.articles;
    },
  },
});
