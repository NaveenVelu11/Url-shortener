const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const urlRoutes = require("./routes/urlRoutes");
const urlController = require("./controllers/urlController");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

if (!process.env.MONGO_URI) {
  console.error("FATAL ERROR: MONGO_URI is not defined. Please check your Vercel Environment Variables.");
} else {
  mongoose.connect(process.env.MONGO_URI)
    .then(()=> console.log("MongoDB Connected"))
    .catch(err=> console.error("MongoDB Connection Error:", err));
}

app.use("/api", urlRoutes);
app.get("/:shortCode", urlController.redirectUrl);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong", details: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 5002;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.listen(PORT, ()=>{
 console.log(`Server running on port ${PORT}`);
 console.log(`Base URL: ${BASE_URL}`);
});