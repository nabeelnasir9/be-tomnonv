const mongoose = require("mongoose");

const PromptSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
  },
});

const Prompt = mongoose.model("Prompt", PromptSchema);

module.exports = Prompt;
