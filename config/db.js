const mongoose = require("mongoose");
require("dotenv").config();

mongoose.set('strictQuery', false);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
        });
        console.log("Connected to database");
    } catch (error) {
        console.error("Error connecting to the database: ", error);
        process.exit(1);
    }
};

module.exports = connectDB;