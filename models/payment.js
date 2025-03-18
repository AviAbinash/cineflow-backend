import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  amount: {
    type: String
  },
  email: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  }
});

export default mongoose.model("Payment", PaymentSchema);
