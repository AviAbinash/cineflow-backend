import mongoose from "mongoose";

export const LikeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video"
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

export default mongoose.model("Like", LikeSchema);