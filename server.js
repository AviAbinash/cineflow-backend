// express framework for creating API routes
import express from "express";
//  cors origin resource sharing 
import cors from  "cors";
import dontenv from "dotenv";
import mongoose from "mongoose";

dontenv.config();

const app = express();
const PORT = process.env.PORT;

// middlewares

app.use(cors());
//parse incoming request
app.use(express.json());

// mongodb connect
// connect to mongodb atlas using the URI for enviroment variables
mongoose
  .connect(process.env.DATABSE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true, //usees the new connection managment for stability in network topology.
  })
  .then((res) => {
    console.log("database connected");
  })
  .catch((err) => {
    console.log(err,"somrthing went wrong");
  });

  // set the port number default to 5000
app.listen(PORT, () => {
  console.log(`server is running on ${PORT}`);
});
