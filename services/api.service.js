"use strict";

const ApiGateway = require("moleculer-web");
const E = require("moleculer-web").Errors;
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../common");

module.exports = {
  name: "api",
  mixins: [ApiGateway],

  settings: {
    port: process.env.PORT || 3000,
    cors: {
      methods: ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"],
      origin: "*",
    },
    routes: [
      {
        path: "/auth",
        whitelist: ["users.signup", "users.login"],
        bodyParsers: {
          json: true,
          urlencoded: { extended: true },
        },
        aliases: {
          "POST signup": "users.signup",
          "POST login": "users.login",
        },
      },
      {
        authorization: true,
        path: "/api/",
        whitelist: [
          // Access to any actions in all services
          "**",
        ],
        bodyParsers: {
          json: true,
          urlencoded: { extended: true },
        },
        aliases: {
          // get member list of channel
          "GET channels/members/:id": "channels.getMembers",

          // channel rest api
          "REST channels": "channels",
          "PUT channels/join/:id": "channels.join",
          "PUT channels/leave/:id": "channels.leave",

          // topics rest api
          "POST topics": "topics.create",
          "PUT topics": "topics.update",
          "GET topics": "topics.list", //@query {channelId: "string"}
          "GET topics/one": "topic.get", //@query {channelId: "string", topicId: "string"}
          "DELETE topics": "topics.remove", //@query {channelId: "string", topicId: "string"}

          "POST messages/": "messages.create",
          "PUT messages/:id": "messages.update",
          "DELETE messages/:id": "messages.remove",
          "GET messages": "messages.list", //@query {channelId: "string", topicId: "string"}
          "GET messages/latest/:id": "messages.latestMessage",
        },
      },
    ],
  },
  methods: {
    authorize(ctx, route, req, res) {
      let auth = req.headers["authorization"];
      if (auth && auth.startsWith("Bearer")) {
        let token = auth.slice(7);

        if (token) {
          const decode = jwt.verify(token, JWT_SECRET_KEY);

          ctx.meta.createdBy = decode["_id"];

          console.log(ctx.meta);
          return Promise.resolve(ctx);
        } else {
          return Promise.reject(new E.UnAuthorizedError(E.ERR_INVALID_TOKEN));
        }
      } else {
        return Promise.reject(new E.UnAuthorizedError(E.ERR_NO_TOKEN));
      }
    },
  },
};
