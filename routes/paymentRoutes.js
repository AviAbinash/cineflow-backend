import express from "express";
import Stripe from "stripe";

const paymentRouter = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET);
