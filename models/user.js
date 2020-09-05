const mongoose = require("mongoose");
const passporLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
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
});
userSchema.plugin(passporLocalMongoose);
module.exports = mongoose.model("User", userSchema);
