import axios from "axios";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// Use a clean, non-VITE-prefixed env var for server-side code.
// Fall back to VITE_SOCCER_TOKEN for backward compatibility.
function getApiToken(): string | undefined {
  return process.env.SOCCER_API_TOKEN || process.env.VITE_SOCCER_TOKEN;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  const { competition, status, limit } = req.query;

  if (!competition) {
    res.status(400).json({ error: "competition is required" });
    return;
  }

  const apiToken = getApiToken();
  if (!apiToken) {
    console.error("Soccer API token not configured");
    res.status(500).json({ error: "Soccer API token not configured" });
    return;
  }

  try {
    const params: Record<string, string | number> = {};
    if (status) params.status = String(status);
    if (limit) params.limit = parseInt(String(limit), 10);

    const response = await axios.get(
      `https://api.football-data.org/v4/competitions/${String(competition)}/matches`,
      {
        headers: {
          "X-Auth-Token": apiToken,
        },
        params,
      }
    );
    res.setHeader(
      "Cache-Control",
      "public, max-age=300, s-maxage=300, stale-while-revalidate=600"
    );
    res.status(200).json(response.data);
  } catch (error) {
    const axiosError = error as any;
    const errStatus = axiosError.response?.status || 500;
    console.error(
      "Soccer API upstream error:",
      axiosError.response?.data || axiosError.message
    );
    res.status(errStatus).json({ error: "Soccer API error" });
  }
}
