const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });


module.exports.index = async (req,res) => {
    const allListings = await Listing.find();
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm =  (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListings = async (req,res) => {
    let {id} = req.params;
    const listings = await Listing.findById(id).populate({path: "reviews", populate: {path:"author"},}).populate("owner");
    if( ! listings){
        req.flash("error", "Listing You requested does not exit ❌ ");//
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listings});
};

module.exports.createListing = async (req,res,next)=> {
    let response = await geocodingClient.forwardGeocode({
    query: req.body.listing.location,
    limit: 1,
    })
    .send();

    let url = req.file.path;
    let filename = req.file.filename;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
   if (response.body.features.length === 0) { // for invalid input from location || not finded 
    req.flash("error", "Location not found! Please enter a valid location."); 
    return res.redirect("/listings/new");
    }
    newListing.geometry = response.body.features[0].geometry;
    
    let saveListings = await newListing.save();
    
    req.flash("success", "New Listing created ✅ ");
    res.redirect("/listings");
};

module.exports.renderEditForm = async (req,res)=> {
    let {id} = req.params;
    const listings = await Listing.findById(id);
    if( ! listings){
        req.flash("error", "Listing You requested does not exit ❌ ");//
        return res.redirect("/listings");
    }

    let originalImageUrl = listings.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_350");
    res.render("listings/edit.ejs",{listings , originalImageUrl});
};
module.exports.updateListings = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url , filename };
        await listing.save();
    }

    req.flash("success", "Listing updated ✅ ");
    res.redirect(`/listings/${id}`);  
};
module.exports.destroyListings = async(req,res)=> {
    let {id} = req.params;

    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listings is Deleted ❌ ");
    res.redirect("/listings");
};

module.exports.index = async (req, res) => {
    const { q } = req.query; // Grabs the search term from the URL
    
    if (q) {
        // If a search term exists, search for it
        const allListings = await Listing.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },    // Search Title (Case-insensitive)
                { location: { $regex: q, $options: 'i' } }, // Search Location
                { country: { $regex: q, $options: 'i' } },  // Search Country
                { category: { $regex: q, $options: 'i' } }  // Search Category (Optional)
            ]
        });

        // If nothing found, show a flash message
        if(allListings.length === 0) {
            req.flash("error", "No listings found matching your search.");
            return res.redirect("/listings");
        }

        res.render("listings/index.ejs", { allListings });
        
    } else {
        // If no search term, show ALL listings (Default behavior)
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings });
    }
};