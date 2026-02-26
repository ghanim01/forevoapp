import { ref } from "vue";
import { defineStore } from "pinia";
import cities from "cities.json";
import _ from "lodash";
import axios from "axios";

interface Article {
  id: number;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: { name: string };
  content: string;
  author: string | null;
  authors: string[] | null;
  language: string;
  category: string;
  source_country: string;
  sentiment: number;
}

interface NewsResponse {
  news: any[];
}

interface CityData {
  name: string;
  country: string;
  lat: string | number;
  lng: string | number;
}

export const useNewsStore = defineStore("newsStore", {
  state: () => ({
    newsSearchResult: ref<Article[]>([]),
    cityresponseResult: ref<CityData | null>(null),
    isLoading: false,
  }),
  getters: {
    getNewsResult(): Article[] {
      return this.newsSearchResult;
    },
  },
  actions: {
    searchCity(city: string) {
      const z = city.toLocaleLowerCase().trim();
      const y = z[0].toUpperCase() + z.slice(1);
      const x = _.findIndex(cities as any[], function (o: any) {
        return o.name === y;
      });
      if (x === -1) {
        console.error("City not found:", city);
        return;
      }
      this.cityresponseResult = (cities as any[])[x];
      this.searchNews();
    },
    async searchNews() {
      this.isLoading = true;
      try {
        const cityData = this.cityresponseResult as CityData | null;
        if (!cityData) {
          console.error("No city selected");
          this.newsSearchResult = [];
          return;
        }

        const response = await axios.get("/api/news", {
          params: {
            country: cityData.country,
            language: "en",
            number: 10,
          },
        });

        if (!response?.data?.news || !Array.isArray(response.data.news)) {
          console.warn("No news articles found");
          this.newsSearchResult = [];
          return;
        }

        this.newsSearchResult = response.data.news.map((article: any) => ({
          id: article.id,
          title: article.title,
          description: article.summary || article.text?.substring(0, 200) || "",
          url: article.url,
          urlToImage: article.image || null,
          publishedAt: article.publish_date,
          source: { name: article.author || "Unknown Source" },
          content: article.text,
          author: article.author,
          authors: article.authors,
          language: article.language,
          category: article.category,
          source_country: article.source_country,
          sentiment: article.sentiment,
        }));
      } catch (error: any) {
        console.error("News API error:", error?.response?.data || error.message);
        this.newsSearchResult = [];
      } finally {
        this.isLoading = false;
      }
    },
  },
});
