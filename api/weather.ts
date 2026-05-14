import axios from "axios";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Use a clean, non-VITE-prefixed env var for server-side code.
// Fall back to VITE_APP_ID for backward compatibility.
function getApiKey(): string | undefined {
  return process.env.OPENWEATHER_API_KEY || process.env.VITE_APP_ID;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const { lat, lon, units } = req.query;

  if (!lat || !lon) {
    res.status(400).json({ error: "lat and lon are required" });
    return;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("Weather API key not configured");
    res.status(500).json({ error: "Weather API key not configured" });
    return;
  }

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat,
          lon,
          appid: apiKey,
          units: units || "metric",
        },
      }
    );

    // Set cache headers for better performance
    res.setHeader("Cache-Control", "public, max-age=600, s-maxage=600");
    res.status(200).json(response.data);
  } catch (error) {
    const axiosError = error as any;
    const status = axiosError.response?.status || 500;
    console.error(
      "Weather API upstream error:",
      axiosError.response?.data || axiosError.message
    );
    res.status(status).json({ error: "Weather API error" });
  }
}
