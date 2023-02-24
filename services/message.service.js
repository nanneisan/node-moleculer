"use strict";
const { dbService, mongooseAdapter } = require("../models");
const Message = require("../models/message");

module.exports = {
  name: "messages",
  mixins: [dbService],
  adapter: mongooseAdapter,
  model: Message,

  actions: {
    create: {
      params: { message: "string", channelId: "string", topicId: "string" },

      async handler(ctx) {
        let params = ctx.params;
        let { createdBy } = ctx.meta; // login userId

        if (params.channelId && params.topicId && params.message) {
          let body = {
            message: params.message,
            createdBy: createdBy,
            channelId: params.channelId,
            topicId: params.topicId,
          };

          let newMessage = await Message.create(body);

          return newMessage;
        } else {
          return { message: "Fail to create message!" };
        }
      },
    },

    update: {
      params: { id: "string", message: "string" },
      async handler(ctx) {
        let params = ctx.params;
        let { createdBy } = ctx.meta;
        if (params.id) {
          let existMsg = await Message.findById(params.id);

          if (existMsg.createdBy == createdBy) {
            existMsg.message = params.message;
          } else {
            return { message: `Owner can only edit the message!` };
          }
          existMsg.save();
          return existMsg;
        } else {
          return { message: "Fail to edit message!" };
        }
      },
    },

    remove: {
      params: { id: "string" },
      async handler(ctx) {
        let params = ctx.params;
        let { createdBy } = ctx.meta;

        let existMsg = await Message.findById(params.id);
        if (existMsg.createdBy == createdBy) {
          await existMsg.remove();
          return { message: "Successfully deleted the message." };
        } else {
          return { message: `Owner can only delete the message!` };
        }
      },
    },

    removeByChannelId: {
      params: { channelId: "string" },
      async handler(ctx) {
        let params = ctx.params;

        let existMsg = await Message.deleteMany({
          channelId: params.channelId,
        });
        if (existMsg) {
          return existMsg;
        } else {
          return { message: `Fail to delete the message!` };
        }
      },
    },

    removeByTopicId: {
      params: { topicId: "string" },
      async handler(ctx) {
        let params = ctx.params;

        let existMsg = await Message.deleteMany({ topicId: params.topicId });
        if (existMsg) {
          return existMsg;
        } else {
          return { message: `Fail to delete the message!` };
        }
      },
    },

    list: {
      params: {
        searchkey: "string",
        topicId: "string",
        page: "number",
        limit: "number",
      },

      async handler(ctx) {
        let { searchkey, topicId, page = 1, limit = 10 } = ctx.params;
        let skip = page > 1 ? (page - 1) * limit : 0;

        let query = {
          topicId: topicId,
        };

        if (searchkey) {
          query.message = { $regex: searchkey, $options: "i" };
        }

        let messages = await Message.find(query)
          .lean()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate("createdBy", "firstName lastName");

        const count = await Message.count(query);

        return {
          rows: messages,
          total: count,
          page: Number(page),
          pageSize: Number(limit),
          totalPages: Math.ceil(count / limit),
        };
      },
    },

    latestMessage: {
      params: { id: "string" }, // channelId or topicId
      async handler(ctx) {
        let { id } = ctx.params;

        let message = await Message.findOne({
          $or: [
            {
              topicId: id,
            },
            {
              channelId: id,
            },
          ],
        })
          .lean()
          .select("message createdBy channelId topicId createdAt")
          .sort({ createdAt: -1 })
          .limit(1)
          .populate("createdBy", "firstName");
        return message || {};
      },
    },
  },
};
