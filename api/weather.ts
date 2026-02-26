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

  try {
    const response = await axios.get(
      "https://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat,
          lon,
          appid: process.env.VITE_APP_ID,
          units: units || "metric",
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    const axiosError = error as any;
    const status = axiosError.response?.status || 500;
    res.status(status).json({ error: "Weather API error" });
  }
}
