const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otp: { type: String },
  verified: { type: Boolean },
  selectedImages: { type: Array },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  orderedImages: { type: Array },
  otp_expiry: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

// Function to check if a string is a valid bcrypt hash
function isBcryptHash(str) {
  return /^\$2[ayb]\$.{56}$/.test(str);
}

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Log the current password before hashing
  console.log("Original password (before hashing):", this.password);

  // Only hash the password if it is not already a bcrypt hash
  if (!isBcryptHash(this.password)) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  // Log the password after hashing
  console.log("Hashed password (after hashing):", this.password);

  next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;
