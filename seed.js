const mongoose = require("mongoose");
const Tweet = require("./models/tweet");
const User = require(__dirname + "/models/user");
data = [
  {
    username: "RK",
    email: "rk@something.com",
    password: "rkPassword",
  },
  {
    username: "Dv",
    email: "dv@email.com",
    password: "dvPassword",
  },
  {
    username: "VD",
    email: "vd@dwivedi.com",
    password: "vdPassword",
  },
];
function seedDB() {
  User.remove({}, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("removed all users");
      data.forEach((seed) => {
        User.create(seed, (err, user) => {
          if (err) {
            console.log(err);
          } else {
            console.log("added a user");
            // Remove all tweets
            Tweet.remove({}, (err) => {
              if (err) console.log(err);
              else {
                console.log("All Tweets removed");
                //Create a tweet
                Tweet.create(
                  {
                    content: "This is the first tweet for all users",
                    author: user,
                  },
                  (err, tweet) => {
                    user.tweets.push(tweet);
                    user.save();
                    console.log("New tweet added");
                  }
                );
              }
            });
          }
        });
      });
    }
  });
}

module.exports = seedDB;
