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
      console.log(`News API attempt ${attempt + 1} failed: ${error.message}`);
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
  const { country, language = "en", offset = 0, number = 10 } = req.query;

  const getYesterdayDateFormatted = (): string => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
  };

  if (!country) {
    return res.status(400).json({ error: "country is required" });
  }

  const apiKey = process.env.VITE_WORLD_NEWS_API_KEY || process.env.WORLD_NEWS_API_KEY;
  if (!apiKey) {
    console.error("World News API key not configured");
    return res.status(500).json({ error: "World News API key not configured" });
  }

  try {
    // Call World News API search-news endpoint with retry logic
    const response = await fetchWithRetry(
      "https://api.worldnewsapi.com/search-news",
      {
        params: {
          "source-country": String(country).toLowerCase(),
          language: String(language).toLowerCase(),
          date: getYesterdayDateFormatted(),
          offset: parseInt(String(offset)),
          number: parseInt(String(number)),
        },
        headers: {
          "x-api-key": apiKey,
        },
      },
      3, // max 3 retries
      2000 // start with 2 second delay
    );

    // Return World News API response format directly
    res.status(200).json({
      offset: response.data.offset || parseInt(String(offset)),
      number: response.data.number || parseInt(String(number)),
      available: response.data.available || 0,
      news: response.data.news || [],
    });
  } catch (error) {
    const axiosError = error as any;
    console.error("World News API error after retries:", axiosError.message);
    const status = axiosError.response?.status || 500;
    res.status(status).json({
      error: "News API error",
      message: axiosError.message,
    });
  }
}
