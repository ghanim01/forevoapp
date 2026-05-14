import { defineStore } from "pinia";
import http from "../api/http";
import type { Article } from "../types";

const CACHE_KEY = "forevo_news_cache";
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours
const STALE_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours – refresh in background after this

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

/** Get human-readable "last updated" text from cache timestamp */
export function getCacheAge(): string | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: NewsCache = JSON.parse(raw);
    const diffMs = Date.now() - cache.timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  } catch {
    return null;
  }
}

/**
 * GNews search queries for Middle East trending news.
 * Uses multiple targeted queries on a rotation to get broader coverage
 * within the 100-request/day free tier (we use ~4/day with caching).
 */
const MIDDLE_EAST_QUERIES = [
  "Middle East OR Gulf OR Saudi OR UAE OR Egypt OR Lebanon OR Israel OR Jordan OR Iraq OR Syria",
  "Middle East politics OR economy OR business OR technology OR energy",
  "Dubai OR Riyadh OR Cairo OR Abu Dhabi OR Doha OR Kuwait OR Muscat",
];

// Rotate through queries to get diverse content across cache refreshes
let queryIndex = 0;

function getNextQuery(): string {
  const query = MIDDLE_EAST_QUERIES[queryIndex];
  queryIndex = (queryIndex + 1) % MIDDLE_EAST_QUERIES.length;
  return query;
}

export const useNewsStore = defineStore("newsStore", {
  state: () => ({
    newsSearchResult: [] as Article[],
    isLoading: false,
    error: null as string | null,
    lastUpdated: null as string | null,
    _abortController: null as AbortController | null,
  }),
  getters: {
    getNewsResult(): Article[] {
      return this.newsSearchResult;
    },
    getLastUpdated(): string | null {
      return this.lastUpdated;
    },
  },
  actions: {
    /** Load Middle East news – serves from cache if fresh (<6h), background-refresh if stale (<2h) */
    async fetchNews(forceRefresh = false) {
      // Try cache first
      if (!forceRefresh) {
        const cached = loadCache();
        if (cached) {
          this.newsSearchResult = cached.articles;
          this.lastUpdated = getCacheAge();

          // If cache is stale but not expired, refresh in background
          const ageMs = Date.now() - cached.timestamp;
          if (ageMs > STALE_DURATION_MS && ageMs < CACHE_DURATION_MS) {
            // Background refresh - don't show loading state
            this.fetchInBackground();
          }
          return;
        }
      }

      await this.executeFetch();
    },

    /** Background refresh without showing loading state */
    async fetchInBackground() {
      try {
        const response = await http.get("/news", {
          params: {
            q: getNextQuery(),
            language: "en",
            max: 10,
          },
        });

        const articles = response.data?.articles ?? [];
        if (articles.length > 0) {
          const mapped = this.mapArticles(articles);
          this.newsSearchResult = mapped;
          saveCache(mapped);
          this.lastUpdated = "Just now";
        }
      } catch {
        // Silently fail – keep the stale cache
      }
    },

    async executeFetch() {
      // Cancel any in-flight request
      if (this._abortController) {
        this._abortController.abort();
      }
      this._abortController = new AbortController();
      const signal = this._abortController.signal;

      this.isLoading = true;
      this.error = null;

      try {
        // Try primary query first
        let articles = await this.tryQuery(getNextQuery(), signal);

        // If no results, try a simpler fallback query
        if (!articles || articles.length === 0) {
          articles = await this.tryQuery("Middle East news", signal);
        }

        if (!articles || articles.length === 0) {
          this.error = "No news articles found. Please try again later.";
          this.newsSearchResult = [];
          return;
        }

        const mapped = this.mapArticles(articles);
        this.newsSearchResult = mapped;
        this.lastUpdated = "Just now";
        saveCache(mapped);
      } catch (err: any) {
        if (
          err.name !== "CanceledError" &&
          err.code !== "ERR_CANCELED"
        ) {
          console.error("News API error:", err?.response?.data || err.message);
          const status = err?.response?.status;
          if (status === 429) {
            this.error =
              "Daily news limit reached. Try again tomorrow or refresh later.";
          } else if (status === 403) {
            this.error = "News API key invalid. Please check configuration.";
          } else if (status === 500 || status === 502 || status === 503) {
            this.error = "News service is temporarily unavailable. Try again soon.";
          } else {
            this.error = "Failed to load news articles. Please try again.";
          }
          // Try to serve stale cache on error
          const cached = loadCache();
          if (cached && cached.articles.length > 0) {
            this.newsSearchResult = cached.articles;
            this.lastUpdated = getCacheAge();
            this.error = null; // Clear error, serve stale data silently
          } else {
            this.newsSearchResult = [];
          }
        }
      } finally {
        this.isLoading = false;
      }
    },

    async tryQuery(
      query: string,
      signal?: AbortSignal
    ): Promise<any[]> {
      try {
        const response = await http.get("/news", {
          params: {
            q: query,
            language: "en",
            max: 10,
          },
          signal,
        });
        return response.data?.articles ?? [];
      } catch {
        return [];
      }
    },

    mapArticles(articles: any[]): Article[] {
      return articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        description: article.description || "",
        url: article.url,
        urlToImage: article.image || null,
        publishedAt: article.publishedAt,
        source: {
          name: article.source?.name || "Unknown Source",
        },
        content: article.content || "",
        author: article.source?.name || null,
        authors: null,
        language: article.lang,
        category: "",
        source_country: article.source?.country || "",
        sentiment: 0,
      }));
    },
  },
});
