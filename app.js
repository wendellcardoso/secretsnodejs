//jshint esversion:6
//require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const encrypt = require("mongoose-encryption");
const bcrypt = require("bcrypt");
const ejs = require("ejs");

const saltRounds = 10;

const app = express();

mongoose.connect("mongodb://localhost:27017/useDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home");
});

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {

        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            if (!err) {
                const newUser = new User({
                    email: req.body.username,
                    password: hash
                });

                newUser.save((err) => {
                    if (!err) {
                        res.render("secrets");
                    } else {
                        console.log(err);
                    }
                });
            } else {
                console.log(err);
            }
        });
    });

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {

        const username = req.body.username;
        const password = req.body.password;

        User.findOne({ email: username }, (err, foundUser) => {
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    bcrypt.compare(password, foundUser.password, function (err, result) {
                        if (result === true) {
                            res.render("secrets");
                        } else {
                            res.send("Senha incorreta.");
                        }
                    });
                } else {
                    res.send("Usuario nao encontrado.");
                }
            }
        });

    });



app.listen(3000, () => {
    console.log("Server started on port 3000.");
});