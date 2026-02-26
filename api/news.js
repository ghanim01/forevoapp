const axios = require("axios");

module.exports = async function handler(req, res) {
  const { country, sortBy } = req.query;

  if (!country) {
    return res.status(400).json({ error: "country is required" });
  }

  try {
    const response = await axios.get("https://newsapi.org/v2/top-headlines", {
      params: {
        country,
        sortBy: sortBy || "publishedAt",
        apiKey: process.env.NEWS_API_KEY,
      },
    });
    res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: "News API error" });
  }
};
