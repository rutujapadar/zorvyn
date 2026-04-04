const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  amount: { type: Number, required: true },

  type: {
    type: String,
    enum: ["income", "expense"],
    required: true
  },

  category: { type: String },

  date: {
    type: Date,
    default: Date.now
  },

  note: {
    type: String
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model("Record", recordSchema);