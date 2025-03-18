import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
  title: String,
  type: String,
  genre: String,
  url: String, //link to the video file in the storage (cloud or local)
  poster:String,
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

export default mongoose.model("Video", VideoSchema);
