const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const expressSession = require("express-session");
const hbs = require("hbs");
const User = require(__dirname + "/models/user");
const Tweet = require(__dirname + "/models/tweet");
const Comment = require(__dirname + "/models/comment");
const generate_random_pics = require(__dirname + "/random_data/pics");
const moment = require("moment");
// seedDB();
mongoose.connect("mongodb://localhost/tweet_it", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "hbs");
hbs.registerPartials(__dirname + "/views/partials");
hbs.registerHelper("ifCond", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});
hbs.registerHelper("ifSet", function (collection, id, options) {
  let collectionLength = collection.length;

  for (let i = 0; i < collectionLength; i++) {
    console.log(collection[i]);
    if (collection[i].equals(id)) {
      return options.fn(this);
    }
  }

  return options.inverse(this);
});
app.use(
  expressSession({
    secret: "You shouldn't read this.",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(function (req, res, next) {
  if (req.user) {
    res.locals.user = req.user;
  }
  next();
});
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
//=============
// Routes
//=============

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/explore", isLoggedIn, (req, res) => {
  res.render("explore");
});

// Auth Routes
// to show signup form
app.get("/register", (req, res) => {
  res.render("signup");
});

// to register user
app.post("/register", (req, res) => {
  User.register(
    new User({
      username: req.body.username,
      email: req.body.email,
      name: req.body.name,
      profile_pic: generate_random_pics("profile"),
      cover_pic: generate_random_pics("cover"),
    }),
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        return res.render("signup");
      }
      passport.authenticate("local")(req, res, () => {
        res.redirect("/explore");
      });
    }
  );
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/explore",
    failureRedirect: "/login",
  }),
  (req, res) => {}
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

app.get("/profile/:username", isLoggedIn, (req, res) => {
  User.findOne({ username: req.params.username })
    .populate({
      path: "tweets",
      model: "Tweet",
      populate: {
        path: "comments",
        model: "Comment",
        populate: {
          path: "author",
          model: "User",
        },
      },
    })
    .exec((err, userProfile) => {
      if (err) {
        console.log(err);
        return res.redirect("/login");
      }

      res.render("profile", { person: userProfile });
    });
});
app.post("/:userId/tweets/new", isLoggedIn, (req, res) => {
  User.findById(req.params.userId, (err, user) => {
    if (err) {
      console.log(err);
      console.log("user not found");
      return res.redirect("/");
    }

    Tweet.create(
      {
        author: user,
        content: req.body.tweetContent,
        dateTime: moment().calendar(),
      },
      (err, tweet) => {
        if (err) console.log(err);
        else {
          user.tweets.unshift(tweet);
          user.save();
          res.redirect("/profile/" + user.username);
        }
      }
    );
  });
});

app.get("/:tweetId/unlike", isLoggedIn, (req, res) => {
  Tweet.findById(req.params.tweetId, (err, tweet) => {
    if (err) {
      console.log(err);
      res.send("A problem occured in unliking the tweet");
    } else {
      for (let i = 0; i < tweet.likes.length; i++) {
        if (tweet.likes[i].equals(req.user._id)) {
          tweet.likes.splice(i, 1);
        }
      }
      tweet.save();
      res.send("Tweet disliked new like count is " + tweet.likes.length);
    }
  });
});
app.get("/:tweetId/like", isLoggedIn, (req, res) => {
  Tweet.findById(req.params.tweetId, (err, tweet) => {
    if (err) {
      console.log(err);
      res.send("Error liking tweet");
    } else {
      tweet.likes.push(req.user);
      tweet.save();
      res.send("Tweet liked new count is " + tweet.likes.length);
    }
  });
});
app.post("/:tweetId/comments/new", isLoggedIn, (req, res) => {
  Tweet.findById(req.params.tweetId, (err, tweet) => {
    if (err) {
      console.log(err);
      console.log("Unable to find Tweet");
    } else {
      Comment.create(
        {
          content: req.body.comment,
          author: req.user,
        },
        (err, comment) => {
          if (err) {
            console.log(err);
            res.send("Unable to comment " + err);
          } else {
            tweet.comments.unshift(comment);
            tweet.save();
            res.send(req.user);
          }
        }
      );
    }
  });
});
app.listen(3000, () => {
  console.log("Server started at http://localhost:3000");
});
