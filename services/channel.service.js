"use strict";

const { dbService, mongooseAdapter } = require("../models");
const Channel = require("../models/channel");

module.exports = {
  name: "channels",
  mixins: [dbService],
  adapter: mongooseAdapter,
  model: Channel,
  settings: {
    populates: {
      createdBy: {
        action: "users.get",
        params: {
          fields: "usercode name",
        },
      },
    },
  },
  actions: {
    create: {
      params: {
        name: "string", // channel name
      },
      async handler(ctx) {
        const params = ctx.params;
        const { createdBy } = ctx.meta;

        try {
          let body = {
            name: params.name,
            createdBy: createdBy,
            members: [createdBy],
          };

          let channel = await Channel.create(body);

          return { message: "Channel is created successfully." };
        } catch (err) {
          return { message: err.message };
        }
      },
    },

    update: {
      params: { id: "string", name: "string" },
      async handler(ctx) {
        const params = ctx.params;
        const { createdBy } = ctx.meta;

        try {
          let channel = await Channel.findOneAndUpdate(
            {
              _id: params.id,
              createdBy: createdBy,
            },
            { name: params.name }
          );

          if (!channel) {
            return {
              message: "Owner can only update the channel.",
            };
          }
          return channel;
        } catch (err) {
          return { message: err.message };
        }
      },
    },

    list: {
      params: { searchkey: "string", page: "number", limit: "number" },
      async handler(ctx) {
        const { searchkey, page = 1, limit = 10 } = ctx.params;
        let { createdBy } = ctx.meta;
        let skip = page > 1 ? (page - 1) * limit : 0;

        let query = {};

        if (searchkey) {
          query.name = { $regex: searchkey, $options: "i" };
        }

        const channels = await Channel.find(query)
          .lean()
          .select("name members createdBy")
          .skip(skip)
          .limit(limit);

        channels.map(async (one) => {
          console.log(one.members, createdBy);
          one.message = await ctx.call("messages.latestMessage", {
            id: one._id,
          });
        });

        const count = await Channel.count();
        return {
          rows: channels,
          total: count,
          page: Number(page),
          pageSize: Number(limit),
          totalPages: Math.ceil(count / limit),
        };
      },
    },

    get: {
      handler(ctx) {
        return Channel.findById(ctx.params.id)
          .select("name members createdBy")
          .populate("createdBy", "firstName lastName");
      },
    },

    remove: {
      async handler(ctx) {
        const params = ctx.params;
        const { createdBy } = ctx.meta;

        try {
          let channel = Channel.findOneAndDelete({
            _id: params.id,
            createdBy: createdBy,
          });

          if (!channel) {
            return { message: "You can not delete the channel!" };
          }

          // remove all message of this channel
          await ctx.call("messages.removeByChannelId", {
            channelId: params.id,
          });
          return { message: "Successfully deleted the channel." };
        } catch (err) {
          return { message: err.message };
        }
      },
    },

    getMembers: {
      handler(ctx) {
        const params = ctx.params;

        try {
          let channel = Channel.findById(params.id)
            .select("name members")
            .populate("members", "firstName lastName");

          if (!channel) {
            return { message: "Not found members!" };
          }
          return channel;
        } catch (err) {
          return { message: err.message };
        }
      },
    },

    join: {
      params: { id: "string" },
      async handler(ctx) {
        const params = ctx.params;
        const { createdBy } = ctx.meta;

        try {
          let channel = await Channel.findById(params.id);

          if (!channel) {
            return { message: "Not found channel!" };
          } else if (channel.members.includes(createdBy)) {
            return { message: "Login user already joined the channel." };
          }
          channel.members.push(createdBy);
          await channel.save();
          return { message: "Successfully joined to the channel." };
        } catch (err) {
          return { message: err.message };
        }
      },
    },

    leave: {
      async handler(ctx) {
        const params = ctx.params;
        const { createdBy } = ctx.meta;

        try {
          let channel = await Channel.findById(params.id).select("-topics");

          if (!channel) {
            return { message: "Not found channel!" };
          }
          if (channel.createdBy == createdBy) {
            return {
              message: "Owner can delete the channel instead of leaving!",
            };
          }

          let members = channel.members;
          console.log(channel, "channel");
          if (members.length == 1) {
            return { message: "Owner can only delete the channel!" };
          }

          var filteredArray = members.filter((e) => e != createdBy);
          channel.members = filteredArray;
          await channel.save();
          return channel;
        } catch (err) {
          return { message: err.message };
        }
      },
    },
  },
};
