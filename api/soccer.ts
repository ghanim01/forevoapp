import axios from "axios";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<VercelResponse | void> {
  const { competition, status } = req.query;

  if (!competition) {
    return res.status(400).json({ error: "competition is required" });
  }

  try {
    const response = await axios.get(
      `https://api.football-data.org/v4/competitions/${String(competition)}/matches`,
      {
        headers: {
          "X-Auth-Token": process.env.VITE_SOCCER_TOKEN,
        },
        params: status ? { status } : {},
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    const axiosError = error as any;
    const errStatus = axiosError.response?.status || 500;
    res.status(errStatus).json({ error: "Soccer API error" });
  }
}
