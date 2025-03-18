import mongoose from "mongoose";

//designing the schema of the user
const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: String,
  avatar : String,
});

//creation of user model
export default mongoose.model("User", UserSchema);
