import axios from "axios";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Use a clean, non-VITE-prefixed env var for server-side code.
// Fall back to VITE_GNEWS_API_KEY for backward compatibility.
function getApiKey(): string | undefined {
  return process.env.GNEWS_API_KEY || process.env.VITE_GNEWS_API_KEY;
}

// Retry helper with exponential backoff
async function fetchWithRetry(
  url: string,
  config: any,
  maxRetries = 3,
  baseDelay = 1000
): Promise<any> {
  let lastError: any;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        ...config,
        timeout: 30000, // 30 second timeout
        headers: {
          "User-Agent": "ForevoApp/1.0",
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          Connection: "keep-alive",
          ...config.headers,
        },
      });
      return response;
    } catch (error: any) {
      lastError = error;
      console.log(`GNews API attempt ${attempt + 1} failed: ${error.message}`);
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt); // exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

const VALID_LANGUAGES = ["en", "ar", "fr", "de", "es", "zh", "pt", "it", "ru", "ja"];
const VALID_CATEGORIES = [
  "general",
  "world",
  "nation",
  "business",
  "technology",
  "entertainment",
  "sports",
  "science",
  "health",
  "top",
];

function validateLanguage(lang: string): string {
  const lower = lang.toLowerCase();
  return VALID_LANGUAGES.includes(lower) ? lower : "en";
}

function validateCategory(cat: string): string {
  const lower = cat.toLowerCase();
  return VALID_CATEGORIES.includes(lower) ? lower : "general";
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const { q, country, language = "en", max = 10, category = "general" } = req.query;

  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("GNews API key not configured");
    res.status(500).json({ error: "GNews API key not configured" });
    return;
  }

  try {
    let url: string;
    const params: Record<string, string | number> = {};

    if (q) {
      // Search endpoint – keyword-based query (supports boolean operators)
      url = "https://gnews.io/api/v4/search";
      params.q = String(q);
      params.lang = validateLanguage(String(language));
      params.max = Math.min(parseInt(String(max), 10), 10);
      params.sortby = "publishedAt";
      params.apikey = apiKey;
    } else if (country) {
      // Top-headlines endpoint – country-specific trending articles
      url = "https://gnews.io/api/v4/top-headlines";
      params.category = validateCategory(String(category));
      params.lang = validateLanguage(String(language));
      params.country = String(country).toLowerCase();
      params.max = Math.min(parseInt(String(max), 10), 10);
      params.apikey = apiKey;
    } else {
      res.status(400).json({ error: "Either 'q' or 'country' is required" });
      return;
    }

    const response = await fetchWithRetry(url, { params }, 3, 2000);

    // Normalize GNews response to match app's expected format
    const articles = (response.data.articles || []).map((article: any) => ({
      id: article.id,
      title: article.title,
      description: article.description || "",
      content: article.content || "",
      url: article.url,
      image: article.image || null,
      publishedAt: article.publishedAt,
      lang: article.lang,
      source: {
        id: article.source?.id || null,
        name: article.source?.name || "Unknown Source",
        url: article.source?.url || null,
        country: article.source?.country || String(country).toLowerCase(),
      },
    }));

    res.setHeader(
      "Cache-Control",
      "public, max-age=300, s-maxage=300, stale-while-revalidate=600"
    );
    res.status(200).json({
      totalArticles: response.data.totalArticles || 0,
      articles,
    });
  } catch (error) {
    const axiosError = error as any;
    console.error("GNews API error after retries:", axiosError.message);
    const status = axiosError.response?.status || 500;
    res.status(status).json({
      error: "News API error",
      message: axiosError.message,
    });
  }
}
