const { Schema, model } = require("mongoose");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("../common");

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },

    firstName: { type: String, required: true },
    lastName: { type: String },

    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      usercode: this.usercode,
    },
    JWT_SECRET_KEY,
    { expiresIn: "1w" }
  );

  return token;
};

module.exports = model("User", userSchema);
