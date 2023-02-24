"use strict";

const { dbService, mongooseAdapter } = require("../models");
const User = require("../models/user");

module.exports = {
  name: "users",
  mixins: [dbService],
  adapter: mongooseAdapter,
  model: User,

  actions: {
    signup: {
      params: {
        email: "string",
        fristName: "string",
        lastName: "string",
        password: "string",
      },

      handler(ctx) {
        try {
          const params = ctx.params;
          let newuser = {
            email: params.email,
            firstName: params.firstName,
            lastName: params.lastName,
            password: params.password || 123456,
          };

          let user = new User(newuser);
          user.save();
          if (user) {
            //generate token
            const token = user.generateAuthToken();

            return { token, user };
          } else {
            return "Fail to signup!";
          }
        } catch (err) {
          return err.message;
        }
      },
    },

    login: {
      params: { email: "string", password: "string" },
      async handler(ctx) {
        let params = ctx.params;
        let user = await User.findOne({
          email: params.email,
          password: params.password,
        });

        if (user) {
          const token = user.generateAuthToken();
          return { token, user };
        } else {
          return "Fail to login!";
        }
      },
    },
  },
};
