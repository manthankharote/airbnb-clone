// authentication
const express = require("express");
const router = express.Router();// merge with the child route with the help of merge params
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signupPage));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl,passport.authenticate("local", { failureRedirect: '/login', failureFlash:true }),userController.login);

router.get("/logout", userController.logout);

module.exports = router;