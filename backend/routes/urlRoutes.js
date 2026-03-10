const express = require("express");
const { nanoid } = require("nanoid");
const Url = require("../models/Url");

const router = express.Router();

router.post("/shorten", async (req,res)=>{

 const { originalUrl } = req.body;

 const shortCode = nanoid(6);

 const newUrl = new Url({
   originalUrl,
   shortCode
 });

 await newUrl.save();

 res.json({
   shortUrl: `http://localhost:5002/${shortCode}`
 });

});

module.exports = router;