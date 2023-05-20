require('dotenv').config();

module.exports = {
  cookieSecret: process.env.COOKIE_SECRET,
  mongoConnectionURL: process.env.MONGO_CONNECTION_URL,
  stripePrivateKey: process.env.STRIPE_PRIVATE_KEY,
};

