import mongoose from "mongoose";
import { CommentSchema } from "./comment.js";
import { LikeSchema } from "./like.js";

const VideoSchema = new mongoose.Schema({
  title: String,
  type: String,
  genre: String,
  url: String, //link to the video file in the storage (cloud or local)
  poster:String,
  aiDescription: String,
  likes: {
    type: Number,
    default: 0
  },
  likesBy: [LikeSchema],
  comments: [CommentSchema],
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

export default mongoose.model("Video", VideoSchema);
