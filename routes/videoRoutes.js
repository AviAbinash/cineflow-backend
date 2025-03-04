import express from "express";
import multer from "multer"; // handles multipart form data eg- video/images
import ffmpeg from "ffmpeg"; // for video streming
import path from "path";

import videoScema from "../models/videoScema";
import { title } from "process";

const videoRouter = express.Router;

const upload = multer({ dist: "uploads/" });

videoRouter.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputPath = `upload/${req.file.fileName}.m3u8`;
    ffmpeg(inputPath)
      .output(outputPath)
      .on("end", async () => {
        const newvVideo = new Video({
          title: req.body.title,
          url: outputPath,
        });
        await newvVideo.save();
        res
          .status(201)
          .json({ message: "video uploaded successfully", video: newvVideo })
          .on("error", (err) => {
            res.status(500).json({ error: err.message });
          })
          .run();
      });
  } catch (error) {

    res.status().json({message:"error in uploading video"})
  }
});

export  default videoRouter
