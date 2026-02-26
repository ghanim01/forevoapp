import { ref } from "vue";
import { defineStore } from "pinia";
import cities from "cities.json";
import _ from "lodash";
import axios from "axios";

export const useNewsStore = defineStore("newsStore", {
  state: () => ({
    newsSearchResult: ref([]),
    cityresponseResult: ref(),
    isLoading: false,
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
      if (x === -1) {
        console.error("City not found:", city);
        return;
      }
      this.cityresponseResult = cities[x];
      this.searchNews();
    },
    async searchNews() {
      this.isLoading = true;
      try {
        let response = await axios.get("/api/news", {
          params: {
            country: this.cityresponseResult.country.toLowerCase(),
          },
        });
        this.newsSearchResult = response.data.articles;
      } catch (error) {
        console.error("News API error:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
