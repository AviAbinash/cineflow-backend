import mongoose from "mongoose";

//design the scema of user
const paymentSchema = new mongoose.Schema({
 orderId : String,
 email:String
});

//creation of user model
export default mongoose.model("Payment", paymentSchema);
