//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
const mongodb = require('mongodb');
// const md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const app = express();

const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://127.0.0.1:27017/userDB");
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => { console.log('Connected to MongoDB'); });

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);

app.get("/", (req, res) => {
    res.render("home");
});

app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {
        bcrypt.hash(req.body.password, saltRounds, (error, hash) => {
            const newUser = new User({
                email: req.body.username,
                password: hash
            });
            newUser.save()
                .then(() => {
                    console.log("Added new user");
                    res.render("secrets")
                })
                .catch(error => {
                    console.log(error);
                });
        });
    })

app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({ email: username })
            .then(foundUser => {
                bcrypt.compare(password, foundUser.password, (error, result) => {
                    if (result === true) {
                        res.render("secrets");
                        console.log(password);
                    }
                });
            });
    });


app.listen(port, () => {
    console.log("Successfully connected to port " + port);
})