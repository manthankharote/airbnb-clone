const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");


const userSchema = new Schema({
    email: {
        type: String,
        required: true
    }
});

// If the log above says "object", this next line is why it crashes
userSchema.plugin(passportLocalMongoose.default); 

module.exports = mongoose.model("User", userSchema);
