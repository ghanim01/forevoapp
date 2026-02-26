const axios = require("axios");

module.exports = async function handler(req, res) {
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
          appid: process.env.APP_ID,
          units: units || "metric",
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    const status = error.response?.status || 500;
    res.status(status).json({ error: "Weather API error" });
  }
};
