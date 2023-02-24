const DbService = require("moleculer-db");
const MongooseAdapter = require("moleculer-db-adapter-mongoose");
const { MONGO_URL } = require("../common");

module.exports = {
  dbService: DbService,
  mongooseAdapter: new MongooseAdapter(MONGO_URL),
};
