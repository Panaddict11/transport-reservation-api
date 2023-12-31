const Trip = require("../models/orderModel");
const Transport = require("../models/transportModel");
const sendEmail = require("../utils/sendMail");

async function checkTrips() {
  const now = new Date();
  const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);

  const transports = await Transport.find({
    departureTime: { $gte: now, $lte: thirtyMinutesLater },
  });

  const trips = await Promise.all(
    transports.map(async (transport) => {
      return await Trip.find({ transport: transport._id }).populate(
        "user",
        "firstName lastName email"
      );
    })
  );

  const allTrips = trips.flat();
  const filteredTrips = allTrips.filter((trip) => !trip.reminded);

  for (const trip of filteredTrips) {
    const transport = transports.find((trans) =>
      trans._id.equals(trip.transport)
    );
    const minutesLeft = Math.floor((transport.departureTime - now) / 1000 / 60);
    let originalDepartureTime = new Date(transport.departureTime);
    originalDepartureTime.setHours(originalDepartureTime.getHours());
    let realDateAndTimeInGMT = originalDepartureTime.toGMTString();
    await sendEmail({
      email: `${trip.user.firstName} <${trip.user.email}>`,
      subject: `Upcoming Trip, Id: ${transport._id}`,
      html: `${trip.user.firstName}, Don't forget, your trip "${transport._id}" is starting in <b>${minutesLeft} minutes!</b>... Departure Time <b>${realDateAndTimeInGMT}</b>`,
    });
    trip.reminded = true;
    await trip.save();
  }
}

async function updateUnBookedTrip() {
  const now = new Date();

  const transports = await Transport.find({
    departureTime: { $lt: now },
    status: "not started",
    bookedSeat: 0,
  });

  const updatePromises = transports.map(async (transport) => {
    transport.status = "canceled";
    await transport.save();
  });

  await Promise.all(updatePromises);
}

async function startRide() {
  const now = new Date();

  const transports = await Transport.find({
    departureTime: { $lt: now },
    status: "not started",
  });

  const updatePromises = transports.map(async (transport) => {
    transport.status = "ongoing";
    await transport.save();
  });

  await Promise.all(updatePromises);
}

module.exports = { checkTrips, updateUnBookedTrip, startRide };
