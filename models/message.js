const { Schema, model } = require("mongoose");

const messageSchema = new Schema(
  {
    message: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    channelId: { type: Schema.Types.ObjectId, ref: "Channel", required: true },
    topicId: { type: Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ createdAt: 1 });

module.exports = model("Message", messageSchema);
