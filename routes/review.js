const express = require("express");
const router = express.Router({mergeParams:true});// merge with the child route with the help of merge params
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/reviews");
const Listing = require("../models/listing");
const { validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewControllers = require("../controllers/reviews.js");


//reviews
// post review route
router.post("/",isLoggedIn,validateReview, wrapAsync(reviewControllers.createReview));

// delete review route
router.delete("/:reviewId", isLoggedIn,isReviewAuthor,wrapAsync(reviewControllers.destroyReview));

module.exports = router;