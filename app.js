const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const localStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const expressSession = require("express-session");
const hbs = require("hbs");
const User = require(__dirname + "/models/user");
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
app.use(
  expressSession({
    secret: "You shouldn't read this.",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

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
    new User({ username: req.body.username, email: req.body.email }),
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
