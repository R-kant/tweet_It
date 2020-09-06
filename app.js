const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const expressSession = require("express-session");
const hbs = require("hbs");
const moment = require("moment");
const User = require(__dirname + "/models/user");
const Tweet = require(__dirname + "/models/tweet");
const Comment = require(__dirname + "/models/comment");
const seedDB = require(__dirname + "/seed");
const generate_random_pics = require(__dirname + "/random_data/pics");
// const expressHbs = require("express-handlebars");

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
// const HBS = expressHbs.create({});
hbs.registerHelper("ifCond", function (v1, v2, options) {
  if (v1 === v2) {
    return options.fn(this);
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

app.get("/", isLoggedIn, (req, res) => {
  res.render("home");
});
app.get("/explore", isLoggedIn, (req, res) => {
  res.render("explore");
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
      // userProfile.tweets.forEach((e) => {
      //   console.log(e.comments);
      // });
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
        likes: 0,
        dateTime: moment().calendar(),
      },
      (err, tweet) => {
        if (err) console.log(err);
        else {
          user.tweets.push(tweet);
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
      tweet.likes -= 1;
      tweet.save();
      res.send("Tweet disliked new like count is " + tweet.likes);
    }
  });
});
app.get("/:tweetId/like", isLoggedIn, (req, res) => {
  Tweet.findById(req.params.tweetId, (err, tweet) => {
    if (err) {
      console.log(err);
      res.send("Error liking tweet");
    } else {
      tweet.likes += 1;
      tweet.save();
      res.send("Tweet liked new count is " + tweet.likes);
    }
  });
});
app.post("/:tweetId/comments/new", isLoggedIn, (req, res) => {
  Tweet.findById(req.params.tweetId, (err, tweet) => {
    if (err) {
      console.log(err);
      return res.redirect("/");
    } else {
      Comment.create(
        {
          content: req.body.comment,
          tweet: tweet,
          author: req.user,
        },
        (err, comment) => {
          if (err) {
            console.log(err);
            res.redirect("/");
          } else {
            tweet.comments.push(comment);
            tweet.save();
            res.redirect("/");
          }
        }
      );
    }
  });
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
      name: req.body.name,
      email: req.body.email,
      cover_pic: generate_random_pics("cover"),
      profile_pic: generate_random_pics("profile"),
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
app.listen(3000, () => {
  console.log("Server started at http://localhost:3000");
});
