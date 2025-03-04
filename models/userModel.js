import mongoose from "mongoose";

//design the scema of user
const userSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: String,
});

//creation of user model
export default mongoose.model("User", userSchema);
