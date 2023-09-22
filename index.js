// Import necessary modules
const axios = require("axios");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();
// Define MongoDB connection URL and options
const mongoURL = process.env.MONGODB_URL;
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Create a MongoDB connection
mongoose.connect(mongoURL, mongoOptions);
const db = mongoose.connection;

// Define a schema for the currency exchange rates data
const currencySchema = new mongoose.Schema({
  success: Boolean,
  timestamp: Number,
  base: String,
  date: Date,
  rates: {
    AED: Number,
    AFN: Number,
    ALL: Number,
    // Add more currency fields as needed
  },
});

// Create a model based on the schema
const CurrencyModel = mongoose.model("Currency", currencySchema);

// Function to fetch data from the API and store it in MongoDB
async function fetchDataAndStore() {
  try {
    // Make an API request using axios
    const response = await axios.get(
      "http://data.fixer.io/api/latest?access_key=acb69dcce2f93dd0058b43acac9cf78d"
    );

    // Assuming the API response is an array of objects
    const apiData = response.data;
    const newCurrencyData = new CurrencyModel(apiData);

    // Save the document to MongoDB
    await newCurrencyData.save();

    console.log("Data saved to MongoDB successfully");
  } catch (error) {
    console.error(
      "Error fetching data from the API or saving to MongoDB:",
      error
    );
  } finally {
    // Close the MongoDB connection when done
    db.close();
  }
}

// Call the function to fetch and store data every 1 hours by cronjob
fetchDataAndStore();
const CronJob = require("cron").CronJob;
const job = new CronJob("0 0 */1 * * *", fetchDataAndStore);

job.start();
