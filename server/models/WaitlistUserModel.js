const mongoose = require("mongoose");

const waitlistUsersSchema = new mongoose.Schema({
  DID: { type: String, required: true, unique: true },
  twitterName: { type: String, required: false },
  twitterHandle: { type: String, required: false },
  twitterProfile: { type: String, required: false },
});

const WaitlistUserModel = mongoose.model("waitlistUsers", waitlistUsersSchema);
module.exports = WaitlistUserModel;
