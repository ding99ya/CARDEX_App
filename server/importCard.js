const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const CardModel = require("./models/CardModel");
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

function importDataFromCSV(filePath) {
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      console.log(results);
      CardModel.insertMany(results)
        .then(() => {
          console.log("Data inserted");
          mongoose.connection.close();
        })
        .catch((err) => {
          console.error("Error inserting data", err);
          mongoose.connection.close();
        });
    });
}

importDataFromCSV("./cards.csv");
