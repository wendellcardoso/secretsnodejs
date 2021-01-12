//jshint esversion:6
//require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const encrypt = require("mongoose-encryption");
// const bcrypt = require("bcrypt");
const ejs = require("ejs");

// const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/useDB", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);
//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});

app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
});

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {

        User.register({ username: req.body.username }, req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });
            }
        });

        // bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
        //     if (!err) {
        //         const newUser = new User({
        //             email: req.body.username,
        //             password: hash
        //         });

        //         newUser.save((err) => {
        //             if (!err) {
        //                 res.render("secrets");
        //             } else {
        //                 console.log(err);
        //             }
        //         });
        //     } else {
        //         console.log(err);
        //     }
        // });
    });

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {

        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, (err) => {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets");
                });
            }
        })




        // const username = req.body.username;
        // const password = req.body.password;

        // User.findOne({ email: username }, (err, foundUser) => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         if (foundUser) {
        //             bcrypt.compare(password, foundUser.password, function (err, result) {
        //                 if (result === true) {
        //                     res.render("secrets");
        //                 } else {
        //                     res.send("Senha incorreta.");
        //                 }
        //             });
        //         } else {
        //             res.send("Usuario nao encontrado.");
        //         }
        //     }
        // });

    });



app.listen(3000, () => {
    console.log("Server started on port 3000.");
});