import Video from "../models/video.js";
import express from "express";
// import OpenAI from "openai";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authenticationToken } from "../middlewares/authMiddleware.js";

dotenv.config();

const aiRouter = express.Router();

//generate ai based video description
aiRouter.get("/:videoId/description", authenticationToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (video.aiDescription) {
      return res.status(200).json({
        description: video.aiDescription
      });
    }
    //prepare ai prompt
    const prompt = `Write a short, engaging description for a video called ${video.title} in the genre ${video.genre}. Keept it concise and engaging in 50 words.`;
    //call openAI Api
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_SECRET_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent(prompt);
    // console.log(result.response.text());
    const aiDescription = result.response.text();
    video.aiDescription = aiDescription;
    await video.save();
    res.status(200).json({
      message: "Description updated successfully!",
      description: aiDescription
    });
  } catch (error) {
    console
    res.status(500).json({
      message: "Error generating ai description",
      error
    });
  }
});

aiRouter.get("/recommended-movies", async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({
      message: "Error getting recommended movies",
      error
    });
  }
});

export default aiRouter;