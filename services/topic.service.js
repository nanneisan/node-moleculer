"use strict";

const Channel = require("../models/channel");

module.exports = {
  name: "topics",

  actions: {
    // create topic
    create: {
      params: { name: "string", channelId: "string" },
      async handler(ctx) {
        let params = ctx.params;
        let { createdBy } = ctx.meta;

        if (params.name) {
          let body = {
            name: params.name,
            createdBy: createdBy,
            messages: [],
          };

          let channel = await Channel.findById(params.channelId);

          if (!channel) {
            return { message: "Channel is not found!" };
          }

          if (!channel.members.includes(createdBy)) {
            return {
              message:
                "Login user can't not create topic. Please join the channel first!",
            };
          }
          channel.topics.push(body);

          await channel.save();
          return { message: "Topic is created successfully!" };
        } else {
          return { message: "Fail to create topic!" };
        }
      },
    },

    update: {
      params: { name: "string", channelId: "string", topicId: "string" },

      async handler(ctx) {
        let params = ctx.params;
        let { createdBy } = ctx.meta;

        if (params.channelId && params.name) {
          let channel = await Channel.findById(params.channelId);

          let existTopic = channel.topics.id(params.topicId);

          if (existTopic.createdBy == createdBy) {
            existTopic.name = params.name;
          } else {
            return { message: `Login user can't edit the topic!` };
          }
          channel.markModified("topics");
          await channel.save();
          return existTopic;
        } else {
          return { message: "Fail to edit topic!" };
        }
      },
    },

    list: {
      params: { channelId: "string" },
      async handler(ctx) {
        let { channelId } = ctx.params;
        let { createdBy } = ctx.meta;

        let channels = await Channel.findById(channelId);

        if (!channels.members.includes(createdBy)) {
          return {
            message: "You can't see the topics. Please join the channel first!",
          };
        }

        let topics = await Channel.findById(channelId).select("name topics");

        return topics;
      },
    },

    get: {
      params: { channelId: "string", topicId: "string" },
      async handler(ctx) {
        let params = ctx.params;
        let { createdBy } = ctx.meta;
        let channel = await Channel.findById(channelId);

        if (channel.members.includes(createdBy)) {
          let channel = await Channel.findOne({
            id: channelId,
            topics: { _id: params.topicId },
          })
            .select("topics")
            .populate("topics.createdBy", "firstName lastName");
          return channel.topics;
        } else {
          return {
            message: "You can't see the topics. Please join the channel first!",
          };
        }
      },
    },

    remove: {
      params: { channelId: "string", topicId: "string" },

      async handler(ctx) {
        let params = ctx.params;
        let { createdBy } = ctx.meta;

        let channel = await Channel.findById(params.channelId);

        let existTopic = channel.topics.id(params.topicId);

        if (!existTopic) {
          return { message: "Topic is not found!" };
        }
        if (existTopic.createdBy == createdBy) {
          existTopic.remove();
          // remove all message of this channel
          ctx.call("messages.removeByTopicId", { topicId: params.id });
        } else {
          return { message: `Login user can't delete the topic!` };
        }
        channel.markModified("topics");
        await channel.save();
        return { message: "Successfully deleted the topic." };
      },
    },
  },
};
