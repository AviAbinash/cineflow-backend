//express framework for creating API routes
import express from "express";
//cors middleware to allow cross origin requests
import cors from "cors";
//load environment variable in dotenv file
import dotenv from "dotenv";
//ORM to interact with database
import mongoose from "mongoose";

import videoRouter from "./routes/videoRoutes.js";
import emailRouter from "./routes/emailRoutes.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRouter.js";
import aiRouter from "./routes/aiRoutes.js"

//load environment variables from .env file
dotenv.config();
const corsOptions = {
  origin: [
    "*"
    // "http://ec2-13-60-49-247.eu-north-1.compute.amazonaws.com:3000/",
    // "http://ec2-51-21-201-59.eu-north-1.compute.amazonaws.com:3000/",
    // "http://localhost:3000"
    // process.env.FRONTEND_LOCAL_URL,  // Local development
    // process.env.FRONTEND_DEPLOYED_URL,  // Your production frontend URL
    // process.env.FRONTEND_RAHUL_DEPLOYED_URL
    // Add any other domains you want to allow
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// console.log(corsOptions)

//initialize express app
const app = express();

//middlewares
//enabling cors to allow nextjs front end to communicate backend
app.use(cors({
  origin: function (origin, callback) {
    // Allow specific origins
    const allowedOrigins = [
      process.env.FRONTEND_DEPLOYED_URL,
      FRONTEND_RAHUL_DEPLOYED_URL,
      'http://localhost:3000'
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
//parse incoming request
app.use(express.json());

//mongodb connection
//connect to mongodb atlas using the URI from environment variables
mongoose
  .connect(process.env.MONGODB_URI, {
    //the mongodb nodejs version v4+ deprecated the old connection string
    //enabling useNewUrlParser to true ensures mongoose uses the new URL parser
    // useNewUrlParser: true,
    //uses the new connection management for stability in network topology
    // useUnifiedTopology: true
  })
  .then(() => console.log("Mongodb connected"))
  .catch((err) => console.log("MongoDB Error:" + err));

app.use("/api/auth", authRouter);
app.use("/api/video", videoRouter);
app.use("/api/email", emailRouter);
app.use("/api/user", userRouter);
app.use("/api/ai", aiRouter);

//set port number default to 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
