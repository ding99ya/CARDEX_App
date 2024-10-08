const mongoose = require("mongoose");
require("dotenv").config();

// Connect to the MongoDB database
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const inviteCodeSchema = new mongoose.Schema({
  DID: String,
  code: String,
  createdAt: String,
  lastUpdatedAt: String,
  currentUsage: Number,
  totalUsage: Number,
});

const inviteCode = mongoose.model("inviteCodes", inviteCodeSchema);

const createInviteCode = async () => {
  const newInviteCode = new inviteCode({
    DID: "clvoc7dzr00ftne36qf962c4u",
    code: "eHrjdc",
    createdAt: "2024-06-08",
    lastUpdatedAt: "Thu, 26 Sep 2024 21:19:29 GMT",
    currentUsage: 1,
    totalUsage: 15,
  });

  try {
    await newInviteCode.save();
    console.log("InviteCode created successfully:", newInviteCode);
  } catch (error) {
    console.error("Error creating invite code:", error);
  }
};

createInviteCode();
