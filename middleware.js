const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema,reviewSchema } = require("./schema.js");

//check is loggedin or by 
module.exports.isLoggedIn = (req,res,next) => {
     if(!req.isAuthenticated()){
        // after signup logic, redirect url save 
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in create to listings");
        return res.redirect("/login");
    }
    next();
};
// passport he as aahe ki jevha apna originalUrl req.session.redirect madhe store karto tevha passport automatic reset kart te url, that what we make this fuction, he fuction res.locals.redirectUrl madhe store karun aapan use karu shakto
module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

// isOwner or not by searching id by findByid method and equals of res.locals.currUser._id
module.exports.isOwner = async(req,res,next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the owner of this listing");
        return res.redirect(`/listings/${id}`);
    };
    next();
};

module.exports.validateListing = (req,res,next) => {
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};

module.exports.validateReview = (req,res,next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else{
        next();
    }
};


module.exports.isReviewAuthor = async(req,res,next) => {
    let {id, reviewId} = req.params;
    let review = await Review.findById(reviewId);
   
    if(!review.author._id.equals(res.locals.currUser._id)){
        req.flash("error", "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    };
    next();
};