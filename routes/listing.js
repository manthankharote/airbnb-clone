const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingControllers = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudconfig.js")
const upload = multer({ storage }); // dest mens destination

// jar ekach route var multiple request(get post delete) yet asel tr use router.route 
router.route("/")
    .get(wrapAsync(listingControllers.index))
    .post(isLoggedIn,
        upload.single('listing[image]'),
        wrapAsync(listingControllers.createListing)
    );
    

//new rourte
router.get("/new",
    isLoggedIn, 
    listingControllers.renderNewForm
);

// listings/:id
router.route("/:id")
    .get( wrapAsync(listingControllers.showListings))
    .put(isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingControllers.updateListings)
    )
    .delete(isLoggedIn,
        isOwner,
        wrapAsync(listingControllers.destroyListings)
    );

// edit route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    validateListing,
    wrapAsync(listingControllers.renderEditForm)
);

module.exports = router;