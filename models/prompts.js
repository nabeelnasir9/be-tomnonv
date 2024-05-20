const mongoose = require("mongoose");

const PromptSchema = new mongoose.Schema({
  img: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
});

const Prompt = mongoose.model("Prompt", PromptSchema);

module.exports = Prompt;
