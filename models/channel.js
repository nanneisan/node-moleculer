const { Schema, model } = require("mongoose");

const topicSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

topicSchema.index({ createdAt: 1 });

const channelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    members: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    topics: [topicSchema],
  },
  {
    timestamps: true,
  }
);

channelSchema.path("topics").validate(function (val) {
  if (val.length > 100) {
    throw new Error("Topics are exceed the limit range!");
  }
});

channelSchema.index({ createdAt: 1 });

module.exports = model("Channel", channelSchema);
