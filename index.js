const express = require("express");
const cors = require("cors");
const flightRoutes = require("./api/flight/flight.routes");

const app = express();

const corsOptions = {
  origin: ["http://localhost:5001", "http://127.0.0.1:5001"],
};
app.use(cors(corsOptions));

app.use("/api/flight", flightRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
