const axios = require("axios");

module.exports = async function handler(req, res) {
  const { country } = req.query;
  const getYesterdayDateFormatted = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
  };

  if (!country) {
    return res.status(400).json({ error: "country is required" });
  }

  try {
    // Call World News API top-news endpoint
    const response = await axios.get(
      "https://api.worldnewsapi.com/search-news",
      {
        params: {
          "source-country": country.toLowerCase(),
          language: "en",
          "api-key": process.env.VITE_WORLD_NEWS_API_KEY,
          date: getYesterdayDateFormatted(),
        },
      }
    );

    // Transform World News API response to match NewsAPI format
    // for compatibility with existing components
    const articles = [];

    if (response.data.top_news && Array.isArray(response.data.top_news)) {
      response.data.top_news.forEach((cluster) => {
        if (cluster.news && Array.isArray(cluster.news)) {
          cluster.news.forEach((article) => {
            articles.push({
              source: { name: article.author || "Unknown Source" },
              author: article.author || null,
              title: article.title,
              description:
                article.summary || article.text?.substring(0, 200) || "",
              url: article.url,
              urlToImage: article.image || null,
              publishedAt: article.publish_date,
              content: article.text,
              id: article.id,
            });
          });
        }
      });
    }

    // Return in NewsAPI-compatible format
    res.status(200).json({
      status: "ok",
      totalResults: articles.length,
      articles: articles,
    });
  } catch (error) {
    console.error("World News API error:", error.message);
    const status = error.response?.status || 500;
    res.status(status).json({
      error: "News API error",
      message: error.message,
    });
  }
};
