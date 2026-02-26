import { defineStore } from "pinia";
import axios from "axios";
import type { Article } from "../types";

const CACHE_KEY = "forevo_news_cache";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours

interface NewsCache {
  articles: Article[];
  timestamp: number;
}

function loadCache(): NewsCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: NewsCache = JSON.parse(raw);
    if (Date.now() - cache.timestamp > CACHE_DURATION_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cache;
  } catch {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function saveCache(articles: Article[]): void {
  const cache: NewsCache = { articles, timestamp: Date.now() };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Storage full or unavailable – silently ignore
  }
}

// GNews search query for Middle East trending news (uses boolean OR)
const MIDDLE_EAST_QUERY =
  "Middle East OR Gulf OR Saudi OR UAE OR Egypt OR Lebanon OR Israel OR Jordan OR Iraq OR Syria";

export const useNewsStore = defineStore("newsStore", {
  state: () => ({
    newsSearchResult: [] as Article[],
    isLoading: false,
    error: null as string | null,
    _abortController: null as AbortController | null,
  }),
  getters: {
    getNewsResult(): Article[] {
      return this.newsSearchResult;
    },
  },
  actions: {
    /** Load trending Middle East news – serves from cache if fresh (<6 h) */
    async fetchNews(forceRefresh = false) {
      // Try cache first
      if (!forceRefresh) {
        const cached = loadCache();
        if (cached) {
          this.newsSearchResult = cached.articles;
          return;
        }
      }

      // Cancel any in-flight request
      if (this._abortController) {
        this._abortController.abort();
      }
      this._abortController = new AbortController();
      const signal = this._abortController.signal;

      this.isLoading = true;
      this.error = null;

      try {
        // Single API call using GNews search endpoint with Middle East keywords
        const response = await axios.get("/api/news", {
          params: {
            q: MIDDLE_EAST_QUERY,
            language: "en",
            max: 10,
          },
          signal,
        });

        const articles = response.data?.articles ?? [];

        const mapped: Article[] = articles.map((article: any) => ({
          id: article.id,
          title: article.title,
          description: article.description || "",
          url: article.url,
          urlToImage: article.image || null,
          publishedAt: article.publishedAt,
          source: { name: article.source?.name || "Unknown Source" },
          content: article.content || "",
          author: article.source?.name || null,
          authors: null,
          language: article.lang,
          category: "",
          source_country: article.source?.country || "",
          sentiment: 0,
        }));

        this.newsSearchResult = mapped;
        saveCache(mapped);
      } catch (err: any) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error("News API error:", err?.response?.data || err.message);
          this.error = "Failed to load news articles. Please try again.";
          this.newsSearchResult = [];
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
});
