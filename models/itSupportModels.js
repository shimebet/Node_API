const mongoose = require('mongoose');

const itsupportSchema = new mongoose.Schema(
  {
    firstName: { 
        type: String, 
        required: [true, "please enter first name"] },
    lastName: { 
        type: String, 
        required: [true, "please enter last name"] },
    issueTitle: { 
        type: String, 
        required: [true, "please enter Issue Title"] },
    issueDescription: { 
        type: String, 
        required: [true, "please enter Issue Description"] },
    issueSolution: { 
        type: String, 
        required: [true, "please enter Issue Solution"] },
    issueImage: { 
        type: String, 
        required: false }, 
  },
  {
    timestamps: true 
  }
);

const Support = mongoose.model("Support", itsupportSchema);
module.exports = Support;
