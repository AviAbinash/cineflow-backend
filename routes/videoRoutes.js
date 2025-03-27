import express, { response } from "express";
//handles multipart form data
import multer from "multer";
import multerS3 from "multer-s3";
//for video handling
import ffmpeg from "fluent-ffmpeg";
//inbuilt for file paths
import path from "path";
import Video from "../models/video.js";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { authenticationToken } from "../middlewares/authMiddleware.js";
import WatchHistory from "../models/watchHistory.js";
import mongoose from "mongoose";

dotenv.config();
ffmpeg.setFfmpegPath(ffmpegPath.path);

const videoRouter = express.Router();
// console.log(process.env.AWS_S3_ACCESS_KEY_ID,"AWS_S3_ACCESS_KEY_ID")
// console.log(process.env.AWS_S3_SECRET_ACCESS_KEY,"process.env.AWS_S3_SECRET_ACCESS_KEY")

//configuring s3 bucket

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

// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: "cineflow-bucket", //process.env.AWS_S3_BUCKET,
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     key: (req, file, cb) => {
//       cb(null, `videos/${Date.now()}-${path.basename(file.originalname)}`);
//     },
//   }),
// });

// ✅ API Route: Upload Video to AWS S3
videoRouter.post(
  "/upload",
  upload.fields([
    { name: "url", maxCount: 1 },
    { name: "poster", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files || !req.files["url"] || !req.files["poster"]) {
        return res
          .status(400)
          .json({ error: "Both video and image must be uploaded" });
      }

      const videoFile = new Video({
        title: req.body.title, // Video file original name
        type: req.body.type,
        genre: req.body.genre,
        url: req.files["url"][0].location, // S3 URL of the video
        poster: req.files["poster"][0].location, // S3 URL of the image
      });

      // console.log("videoFile", videoFile);
      // Save the video file and image file information in the database
      await videoFile.save();

      res.json({
        message: "Files uploaded successfully to S3",
        videoUrl: req.files["url"][0].location, // Video file URL
        imageUrl: req.files["poster"][0].location, // Image file URL
      });
    } catch (error) {
      res.status(500).json({
        message: "Error Uploading Files",
        error,
      });
    }
  }
);
// videoRouter.post("/upload", upload.single("url"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }
//     const videoFile = new Video({
//       title: req.file.originalname,
//       type: req.body.type,
//       genre: req.body.genre,
//       url: req.file.location,
//     });
//     console.log("videoFile", videoFile);
//     //save videofile to database
//     await videoFile.save();
//     res.json({
//       message: "File uploaded successfully to S3",
//       fileUrl: req.file.location, // Returns S3 file URL
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error Uploading Video",
//       error,
//     });
//   }
// });
// videoRouter.post("/upload", upload.single("url"), async (req, res) => {
//   try {
//     console.log("req", req);
//     const inputPath = req.file.path;
//     const outputPath = `${process.env.VIDEO_STORAGE_PATH}/${req.file.originalname}`;
//     ffmpeg(inputPath)
//       .output(outputPath)
//       .on("end", async () => {
//         const newVideo = new Video({
//           title: req.body.title,
//           url: outputPath
//         });
//         await newVideo.save();
//         res.status(201).json({
//           message: "Video Uploaded Successfully",
//           video: newVideo
//         });
//       })
//       .on("error", (err) => {
//         res.status(500).json({
//           error: err.message
//         });
//       })
//       .run();
//   } catch (error) {
//     res.status(500).json({
//       message: "Error Uploading Video",
//       error
//     });
//   }
// });

videoRouter.get("/getAllVideos", async (req, res) => {
  try {
    const videos = await Video.find({});
    res.status(200).json({
      message: "Videos Fetched Successfully",
      videos: videos,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Uploading Video",
      error,
    });
  }
});

videoRouter.post("/getAllMovies", async (req, res) => {
  try {
    const videos = await Video.find({ type: req.body.type });
    res.status(200).json({
      message: "Videos Fetched Successfully",
      videos: videos,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Uploading Video",
      error,
    });
  }
});

videoRouter.post("/getAllTvShows", async (req, res) => {
  try {
    const videos = await Video.find({ type: req.body.type });
    res.status(200).json({
      message: "Videos Fetched Successfully",
      videos: videos,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error Uploading Video",
      error,
    });
  }
});

videoRouter.post("/:videoId/like", authenticationToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (!video) res.status(404).json({ message: "Error! Video not found" });
    //getting the user id from the authentication middleware which decodes the token and retuen the user data
    const userId = req.user.id;
    const isLiked = video.likesBy.some(
      (item) => item.videoId.toString() === req.params.videoId
    );
    // console.log("userId", userId);

    if (isLiked) {
      video.likes -= 1;
      video.likesBy = video.likesBy.filter((item) => {
        return item.userId.toString() != userId;
      });
      // console.log(video.likesBy);
    } else {
      video.likes += 1;
      video.likesBy.push({ userId: userId, videoId: req.params.videoId });
    }
    await video.save();
    res.status(200).json({
      message: "Updated successfully",
      likes: video.likes,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating likes",
    });
  }
});

videoRouter.post("/:videoId/comment", authenticationToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    // console.log("video", video);
    if (!video) res.status(404).json({ message: "Error! Video not found" });
    //getting the user id from the authentication middleware which decodes the token and retuen the user data
    const userId = req.user.id;
    video.comments.push({
      userId: userId,
      videoId: req.params.videoId,
      text: req.body.text,
    });
    await video.save();
    res.status(200).json({
      status: 200,
      message: "Updated successfully",
      comments: video.comments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating comments",
    });
  }
});

videoRouter.post("/watchHistory", authenticationToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const videoId = req.body.videoId;
    // Fix: Use findOne instead of findById
    let watchData = await WatchHistory.findOne({ userId });
    if (watchData) {
      const videoIdExist = watchData.videoIds?.some(
        (id) => id.toString() === videoId
      );

      if (!videoIdExist) {
        watchData.videoIds.push(videoId);
        await watchData.save(); // Fix: Save the updated document
      }

      return res.status(200).json({
        message: "Watch history updated successfully",
        videoIds: watchData.videoIds,
      });
    } else {
      const newWatchData = new WatchHistory({
        userId,
        videoIds: [videoId],
      });
      await newWatchData.save();
      return res.status(200).json({
        message: "Watch history updated successfully",
        videoIds: newWatchData.videoIds,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error updating watch history",
      error: error.message,
    });
  }
});

videoRouter.get("/getWatchHistory", authenticationToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Fix: Use findOne instead of findById
    let watchData = await WatchHistory.findOne({ userId });
    if (!watchData) {
      return res.status(200).json({ message: "There is no watch history" });
    }
    const videoData = await Video.find({ _id: { $in: watchData.videoIds } });
    res?.status(200).json({
      message: "watch history found",
      watchHistory: videoData,
    });
    // console.log(watchData);
  } catch (error) {
    res.status(500).json({
      message: "Error updating watch history",
      error: error.message,
    });
  }
});

videoRouter.get(
  "/:videoId/getComments",
  authenticationToken,
  async (req, res) => {
    try {
      const result = await mongoose.connection.db
        .collection("videos")
        .aggregate([
          { $match: { _id: new mongoose.Types.ObjectId(req.params?.videoId) } },
          { $unwind: "$comments" },
          {
            $lookup: {
              from: "users", // Reference to users collection
              localField: "comments.userId",
              foreignField: "_id",
              as: "userDetails",
            },
          },
          { $unwind: "$userDetails" }, // Flatten userDetails array
          {
            $project: {
              _id: 0,
              user: {
                id: "$userDetails._id",
                name: "$userDetails.name",
                avatar: "$userDetails.avatar",
              },
              comment: "$comments.text",
              createdAt: "$comments.createdAt",
            },
          },
        ])
        .toArray();
      const getResponse = {
        status: 200,
        result,
      };
      // console.log(result);

      // console.log(result);
      res.status(200).json(getResponse);
    } catch (error) {
      res.status(500).json({
        message: "Error updating watch history",
        error: error.message,
      });
    }
  }
);

videoRouter.get("/:videoId/getLikes", authenticationToken, async (req, res) => {
  try {
    const result = await mongoose.connection.db
      .collection("videos")
      .aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(req.params?.videoId) } },
        { $unwind: "$likes" },
        {
          $lookup: {
            from: "users", // Reference to users collection
            localField: "likes.userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        // { $unwind: "$userDetails" }, // Flatten userDetails array
        // {
        //   $project: {
        //     _id: 0,
        //     user: {
        //       id: "$userDetails._id",
        //       name: "$userDetails.name",
        //       avatar:"$userDetails.avatar"
        //     },
        //     like: "likes",
        //     // createdAt: "$comments.createdAt",
        //   },
        // },
      ])
      .toArray();
    //  const getResponse = {
    //   status:200,
    //   result
    //  }
    // console.log(result);

    // console.log(result);
    res.status(200).json(getResponse);
  } catch (error) {
    res.status(500).json({
      message: "Error updating watch history",
      error: error.message,
    });
  }
});


// Delete a video
videoRouter.delete("/:videoId", async (req, res) => {
  try {
    // Find the video by ID
    const video = await Video.findById(req.params.videoId);

    // Check if video exists
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Delete the video from the database
    await Video.findByIdAndDelete(req.params.videoId);

    // Optional: If you're using S3, delete the video and poster from S3
    // Note: This would require your S3 upload middleware
    // await s3.deleteObject({
    //   Bucket: process.env.AWS_S3_BUCKET_NAME,
    //   Key: video.url.split('/').pop(),
    // }).promise();

    res.status(200).json({
      message: "Video deleted successfully",
      videoId: req.params.videoId
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({
      message: "Error deleting video",
      error: error.message
    });
  }
});

// Update a video
videoRouter.put(
  "/:videoId",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "poster", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const videoId = req.params.videoId;

      // Prepare update object
      const updateData = {
        title: req.body.title,
        genre: req.body.genre,
        type: req.body.type
      };

      // Check if new files are uploaded
      if (req.files) {
        // Update video file if a new one is uploaded
        if (req.files["video"]) {
          updateData.url = req.files["video"][0].location;
        }

        // Update poster if a new one is uploaded
        if (req.files["poster"]) {
          updateData.poster = req.files["poster"][0].location;
        }
      }

      // Optional: Add poster URL if provided
      if (req.body.posterUrl) {
        updateData.poster = req.body.posterUrl;
      }

      // Find and update the video
      const updatedVideo = await Video.findByIdAndUpdate(videoId, updateData, {
        new: true, // Return the updated document
        runValidators: true // Run model validations
      });

      // Check if video exists
      if (!updatedVideo) {
        return res.status(404).json({ message: "Video not found" });
      }

      res.status(200).json({
        message: "Video updated successfully",
        video: updatedVideo
      });
    } catch (error) {
      console.error("Error updating video:", error);
      res.status(500).json({
        message: "Error updating video",
        error: error.message
      });
    }
  }
);

export default videoRouter;
