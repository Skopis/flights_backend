const flightService = require("./flight.service");

async function getFlights(req, res) {
  try {
    const flights = await flightService.query(req.query);

    res.send(flights); 
  } catch (err) {
    res.status(500).send({ err: "Failed to get flights" });
  }
}

module.exports = {
  getFlights,
};
