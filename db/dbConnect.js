const mongoose = require("mongoose");
require("dotenv").config();

async function dbConnect() {

    mongoose
        .connect(
            process.env.URL, 
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log("Connected to mongoDB");
        })
        .catch((err) => {
            console.log("there was an error");
            console.error(err);
        })
}

module.exports = dbConnect