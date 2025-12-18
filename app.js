
if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
const MongoStore = require("connect-mongo").default;;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

// Utils & Routes
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// 1. Database Connection
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => {
        console.log("MongoDB is connected ✅");
    })
    .catch((err) => {
        console.log(err);
    });

// 2. App Configuration (Views & Engines)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// 3. Essential Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public"))); // Static files should be served early

// 4. Session & Flash Configuration
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.log("ERROR ON MONGO SESSION", err)
});
const sessionOption = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};



app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 5. Local Variables Middleware (Flash Messages)
app.use((req, res, next) => {
    // FIX: Changed req.locals to res.locals so views can access it
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error"); // Added error handling convention
    res.locals.currUser = req.user;
    next();
});

// app.get("/demouser" , async(req,res) => {
//     let fakeUser = new User ({
//         email:"kha@gmail.ck",
//         username: "manth",
//     });
//     const registeredUser = await User.register(fakeUser, "helloworld");
//     res.send(registeredUser);
    
// });

// 6. Routes

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);


// 7. Error Handling

// 404 Handler (For all unmatched routes)
app.all(/(.*)/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// Global Error Handler
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went Wrong" } = err;
    res.status(statusCode).render("error.ejs", { message });
});

// 8. Server Start
app.listen(8080, () => {
    console.log("Server is Started ✅");
});