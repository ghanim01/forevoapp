import axios from "axios";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse | void> {
  const { lat, lon, units } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon are required" });
  }

  const apiKey = process.env.VITE_APP_ID || process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    console.error("Weather API key not configured");
    return res.status(500).json({ error: "Weather API key not configured" });
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
    res.status(status).json({ error: "Weather API error" });
  }
}
