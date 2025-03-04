import mongoose from "mongoose";

//design the scema of user
const videoSchema = new mongoose.Schema({
  title: String,
  url: {
    type: String,
    required: true,
  },
  password: String,
  createdAt:{
    type: Date,
    default :Date.now()
  }
});

//creation of user model
export default mongoose.model("VideoSchema", videoSchema);
