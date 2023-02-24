const dotenv = require("dotenv");
dotenv.config();

const env = process.env;

module.exports = {
  PORT: env.PORT,
  MONGO_URL: env.MONGO_URL || "mongodb://localhost/chat-demo",
  JWT_SECRET_KEY: env.JAW_SECRET_KEY,
};
