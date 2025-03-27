import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { authenticationToken } from "../middlewares/authMiddleware.js";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import Video from "../models/video.js";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import ffmpeg from "fluent-ffmpeg";

const userRouter = express.Router();

dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath.path);

const s3 = new S3Client({
  region: "eu-north-1", //process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "cineflow-bucket", //process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      // Save video and image files in their respective folders
      const folder = file.fieldname === "url" ? "videos" : "poster"; // "url" is the field name for video
      cb(null, `${folder}/${Date.now()}-${path.basename(file.originalname)}`);
    },
  }),
});

userRouter.get("/profile", authenticationToken, async (req, res) => {
  try {
    // "-password" refers to exclude the password field
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
      error,
    });
  }
});

userRouter.post(
  "/updateAvatar",
  authenticationToken,
  upload.single("avatar"),
  async (req, res) => {
    // console.log(req.user);
    try {
      const profileAvatar = req?.file?.location; // S3 URL of the image
    //   console.log(profileAvatar);
        const user = await User.findByIdAndUpdate(
          req?.user?.id,
          { avatar: profileAvatar },
          { new: true } // Return the updated user
        );
        res.status(200).json({ message: 'Avatar updated successfully', profileAvatar });
    } catch (error) {
      res.status(500).json({
        message: "Internal Server Error",
        error,
      });
    }
  }
);

userRouter.post("/updateProfile",authenticationToken,async(req,res)=>{
  const userName = req.body.username
   const user = req.user
   console.log(req.user)
   const isPresent = await  User.findById({_id:req.user.id})
   if(isPresent){
    const data =   await User.updateOne({name:userName})
    console.log(data,"data")
   }
   res.status(200).json({ message: 'User details updated sucessfully' });

})
export default userRouter;
