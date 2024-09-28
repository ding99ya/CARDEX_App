const mongoose = require("mongoose");

const inviteCodeSchema = new mongoose.Schema({
  DID: String,
  code: String,
  createdAt: String,
  lastUpdatedAt: String,
  currentUsage: Number,
  totalUsage: Number,
});

const InviteCodeModel = mongoose.model("invitecodes", inviteCodeSchema);
module.exports = InviteCodeModel;
