const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const MONGO_URL = "mongodb+srv://123mankh_db_user:SArRUFfcXg5Ak6tp@attendacesystemqr.7so70tj.mongodb.net/?appName=AttendaceSystemQR";


main().then(()=> {
    console.log("MongoDB is connected ✅")
}).catch((err) => {
    console.log(err);
});
async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj)=>({...obj, owner: "69402fb153cb8d3846e62849"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
};

initDB();