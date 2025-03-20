const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "Please enter first name"] },
    lastName: { type: String, required: [true, "Please enter last name"] },
    userName: { type: String, required: [true, "Please enter username"], unique: true },
    email: { 
      type: String, 
      required: [true, "Please enter email"], 
      unique: true, 
      match: [/.+@.+\..+/, "Invalid email format"] 
    },
    password: { type: String, required: [true, "Please enter password"], minlength: 6 },
    role: { type: String, enum: ["admin", "support", "user"], default: "user" },
  },
  { timestamps: true }
);

// ✅ Ensure Unique Index on Email
userSchema.index({ email: 1 }, { unique: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
