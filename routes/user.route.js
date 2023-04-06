require('dotenv').config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { UserModel } = require("../models/user.model");
const UserRouter = express();

// USERS DATA GET Req
UserRouter.get("/", async (req, res) => {
    const query = req.query;
    try {
        const users = await UserModel.find(query);
        res.send(users);
    } catch (error) {
        res.send({ "Error": error.message });
    }
});


// USER SIGNUP Req
UserRouter.post("/signup", async (req, res) => {
    const { email, password, confirm_password } = req.body;

    try {
        if ( email && password && confirm_password) {
            if(password !==confirm_password) {
                res.send("Password doesn't match, Please enter again");
            }
            const old_user = await UserModel.find({ email: email });
            if (old_user.length > 0) {
                res.send({ "Message": "Email already exists, Please Login" });
            } else {
                bcrypt.hash(password, 5, async (error, hash) => {
                    if (error) {
                        res.send({ "Message": "Hashing failed", "Error": error });
                    } else {
                        const new_user = new UserModel({ email, password: hash, confirm_password });
                        await new_user.save();
                        res.send({ "Message": "New User Registered Successfully" });
                    }
                });
            }
        } else {
            res.send({ "Message": "Fill in all input fields" });
        }
    } catch (error) {
        res.send({ "Message": "Unable to fetch the user data", "Error": error.message });
    }
});


// -------------------- USER LOGIN POST Req -------------------- //
UserRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.find({ email });
        if (user.length > 0 ) {
            bcrypt.compare(password, user[0].password, (error, result) => {
                if (result) {
                    const token = jwt.sign({ userID: user[0]._id }, "user", {expiresIn: 60 * 60 });
                    res.send({ 
                        "Message": `User logged in successfully `
                    });
                } else {
                    res.send({ "Message": "Incorrect Password", "Error": error });
                }
            });
        } else {
            res.send({ "Message": "Incorrect Email Address! Please try again" });
        }
    } catch (error) {
        res.send({ "Message": "Authentication Failed", "Error": error.message });
    }
});

module.exports = { UserRouter };