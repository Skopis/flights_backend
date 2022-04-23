const axios = require("axios");

const BASE_API_URL = "http://api.aviationstack.com/v1/";
const API_KEY = "53cd9310851e3d1252a091b1fb74e458";

// Example: http://api.aviationstack.com/v1/flights?access_key=53cd9310851e3d1252a091b1fb74e458

async function query({ iataCode }) {
  const flights = [];

  try {
    const params = new URLSearchParams({
      access_key: API_KEY,
      dep_iata: iataCode,
      flight_status: "scheduled",
    });

    let res = await axios(`${BASE_API_URL}flights?${params.toString()}`);
    flights.push(...res.data.data);

    if (res.data.pagination.total > 100) {
      // if we have more than 100 results, it means we have more than 1 page and need to make more api calls
      let offset = 100;

      let flightDay = new Date(res.data.data[99].flight_date).getDate(); // flight date(day) of last result on the page
      const today = new Date().getDate();

      while (flightDay >= today && res.data.pagination.count === 100) {
        // while the result is not from yesterday, and we have more pages, we'll keep calling for next page
        console.log("Im in the while loop");

        res = await axios(
          `${BASE_API_URL}flights?${params.toString()}&offset=${offset}`
        );

        flights.push(...res.data.data);

        offset += 100;
        flightDay = new Date(res.data.data[99].flight_date).getUTCDate();
        console.log("latest flight date", flightDay);
      }
    }

    const relevantFlights = flights.filter((flight) => {
      const departureTimeStamp =
        new Date(
          flight.departure.scheduled.substring(
            0,
            flight.departure.scheduled.length - 6
          )
        ).getTime() / 1000;

      const FutureLocalTimeStamp = _getLocalTimestampIn3Hours(
        "en-US",
        "America/New_York"
      );

      return (
        departureTimeStamp >= FutureLocalTimeStamp &&
        departureTimeStamp <= FutureLocalTimeStamp + 3 * 3600
      );
    });

    console.log("flights length", flights.length);
    console.log("relevantFlights length", relevantFlights.length);

    relevantFlights.sort(_compare); // sort by departure time
    console.log("relevantFlights after sort", relevantFlights);
    return relevantFlights;
  } catch (err) {
    console.log("err", err);
    throw err;
  }
}

function _getLocalTimestampIn3Hours(lang, timeZone) {
  const localFutureTimeStamp = Date.now() + 3 * 3600 * 1000; // Timestamp in 3 hours from now
  const newYorkFutureTime = new Date(localFutureTimeStamp).toLocaleString(
    lang,
    {
      timeZone,
    }
  );

  return new Date(newYorkFutureTime).getTime() / 1000;
}

function _compare(a, b) {
  if (a.departure.scheduled < b.departure.scheduled) {
    return -1;
  }
  if (a.departure.scheduled > b.departure.scheduled) {
    return 1;
  }
  return 0;
}

module.exports = {
  query,
};
