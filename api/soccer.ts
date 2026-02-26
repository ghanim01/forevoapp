import axios from "axios";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse | void> {
  const { competition, status, limit } = req.query;

  if (!competition) {
    return res.status(400).json({ error: "competition is required" });
  }

  const apiToken = process.env.VITE_SOCCER_TOKEN || process.env.SOCCER_API_TOKEN;
  if (!apiToken) {
    console.error("Soccer API token not configured");
    return res.status(500).json({ error: "Soccer API token not configured" });
  }

  try {
    const params: any = {};
    if (status) params.status = status;
    if (limit) params.limit = parseInt(String(limit));

    const response = await axios.get(
      `https://api.football-data.org/v4/competitions/${String(competition)}/matches`,
      {
        headers: {
          "X-Auth-Token": apiToken,
        },
        params,
      }
    );
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300, stale-while-revalidate=600");
    res.status(200).json(response.data);
  } catch (error) {
    const axiosError = error as any;
    const errStatus = axiosError.response?.status || 500;
    res.status(errStatus).json({ error: "Soccer API error" });
  }
}
