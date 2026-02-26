const axios = require("axios");

module.exports = async function handler(req, res) {
  const { competition, status } = req.query;

  if (!competition) {
    return res.status(400).json({ error: "competition is required" });
  }

  try {
    const response = await axios.get(
      `https://api.football-data.org/v4/competitions/${competition}/matches`,
      {
        headers: {
          "X-Auth-Token": process.env.SOCCER_TOKEN,
        },
        params: status ? { status } : {},
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    const errStatus = error.response?.status || 500;
    res.status(errStatus).json({ error: "Soccer API error" });
  }
};
