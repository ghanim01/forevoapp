import axios from "axios";
import type { VercelRequest, VercelResponse } from "@vercel/node";

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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse | void> {
  const { q, country, language = "en", max = 10, category = "general" } = req.query;

  const apiKey = process.env.VITE_GNEWS_API_KEY || process.env.GNEWS_API_KEY;
  if (!apiKey) {
    console.error("GNews API key not configured");
    return res.status(500).json({ error: "GNews API key not configured" });
  }

  try {
    let url: string;
    let params: Record<string, string | number>;

    if (q) {
      // Search endpoint – keyword-based query (supports boolean operators)
      // Docs: https://docs.gnews.io/endpoints/search-endpoint
      url = "https://gnews.io/api/v4/search";
      params = {
        q: String(q),
        lang: String(language).toLowerCase(),
        max: Math.min(parseInt(String(max)), 10),
        sortby: "publishedAt",
        apikey: apiKey,
      };
    } else if (country) {
      // Top-headlines endpoint – country-specific trending articles
      // Docs: https://docs.gnews.io/endpoints/top-headlines-endpoint
      url = "https://gnews.io/api/v4/top-headlines";
      params = {
        category: String(category),
        lang: String(language).toLowerCase(),
        country: String(country).toLowerCase(),
        max: Math.min(parseInt(String(max)), 10),
        apikey: apiKey,
      };
    } else {
      return res.status(400).json({ error: "Either 'q' or 'country' is required" });
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

    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=600");
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
