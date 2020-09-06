const mongoose = require("mongoose");
const passporLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
  profile_pic: String,
  username: {
    type: String,
    unique: true,
    required: true,
  },
  name: String,
  email: {
    type: String,
    required: true,
  },
  password: String,
  tweets: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  cover_pic: String,
  gender: String,
});
userSchema.plugin(passporLocalMongoose);
module.exports = mongoose.model("User", userSchema);
