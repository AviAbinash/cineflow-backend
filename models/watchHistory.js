import mongoose from "mongoose";

const WatchHistorySchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  videoIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }]
});

export default mongoose.model("WatchHistory", WatchHistorySchema);