const mongoose = require("mongoose");

// Define invite code schema
const inviteCodeSchema = new mongoose.Schema({
  DID: String,
  code: String,
  createdAt: String,
  lastUpdatedAt: String,
  currentUsage: Number,
});

const InviteCodeModel = mongoose.model("invitecodes", inviteCodeSchema);
module.exports = InviteCodeModel;
