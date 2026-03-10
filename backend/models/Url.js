const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
 originalUrl: { type: String, required: true },
 shortCode: { type: String, required: true, unique: true, index: true },
 clicks: { type: Number, default: 0 },
 createdAt: { type: Date, default: Date.now },
 lastAccessed: { type: Date },
 expiresAt: { type: Date },
 createdBy: { type: String },
 password: { type: String },
 clickLimit: { type: Number },
 clickDetails: [{
   timestamp: Date,
   ip: String,
   userAgent: String
 }]
});

urlSchema.index({ createdAt: 1 });
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Url", urlSchema);