const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please enter first name"],
    },
    lastName: {
      type: String,
      required: [true, "Please enter last name"],
    },
    username: {
      type: String,
      required: [true, "Please enter username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please enter email"],
      unique: true,
      match: [/.+@.+\..+/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["Admin", "IT_Team", "Barnch_Manager, Branch_Staff"],
      default: "user",
    },
    branchName: {
      type: String,
      required: false,
    },
    
    branchAddress: {
      type: String,
      required: [true, "Please enter branch address"],
    },
    
    branchGrade: {
      type: String,
      required: false,
    },
    
    branchId: {
      type: String,
      required: false,
    },
    userImage: {
      type: String, 
      default: '',
      required: false,
    },
    
  },
  { timestamps: true }
);

// Ensure Unique Index
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ userame: 1 }, { unique: true });

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
