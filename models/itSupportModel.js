const mongoose = require('mongoose');

const itsupportSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, "Please enter first name"] },
    lastName: { type: String, required: [true, "Please enter last name"] },
    issueTitle: { type: String, required: [true, "Please enter Issue Title"] },
    issueDescription: { type: String, required: [true, "Please enter Issue Description"] },
    issueSolution: { type: String, required: [true, "Please enter Issue Solution"] },
    issueImage: { type: String, required: false },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Support = mongoose.model("Support", itsupportSchema);
module.exports = Support;
