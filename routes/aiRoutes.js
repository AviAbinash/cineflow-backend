import Video from "../models/video.js";
import express from "express";
// import OpenAI from "openai";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { authenticationToken } from "../middlewares/authMiddleware.js";
import WatchHistory from "../models/watchHistory.js";

dotenv.config();

const aiRouter = express.Router();

//generate ai based video description
aiRouter.get("/:videoId/description", authenticationToken, async (req, res) => {
  try {
    const video = await Video.findById(req.params.videoId);
    if (video.aiDescription) {
      return res.status(200).json({
        description: video.aiDescription,
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
      description: aiDescription,
    });
  } catch (error) {
    console;
    res.status(500).json({
      message: "Error generating ai description",
      error,
    });
  }
});

aiRouter.get("/airecommended-movies", authenticationToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const allVideos = await Video.find({});
    let watchData = await WatchHistory.findOne({ userId });
    let userWatchlist = await Video.find({ _id: { $in: watchData.videoIds } });
    const genreCount = userWatchlist.reduce((acc, movie) => {
      acc[movie.genre] = (acc[movie.genre] || 0) + 1;
      return acc;
  }, {});
  
  // Find the genre with the highest count
  const mostFrequentGenre = Object.keys(genreCount).reduce((a, b) => 
      genreCount[a] > genreCount[b] ? a : b
  );
  // console.log(mostFrequentGenre,"mostFrequentGenre")
    if (!allVideos || !userWatchlist) {
      return res.status(200).json({ message: "There is no watch history" });
    }
    // console.log(watchData, "watchData");
    // console.log(userWatchlist, "userWatchlist");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_AI_SECRET_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    Given a user's watchlist and a complete movie list, rearrange the movie list based on the genres present in the user's watchlist.
  
    User Watchlist: ${JSON.stringify(mostFrequentGenre)}
  
    Movie List: ${JSON.stringify(allVideos)}
  
    Return the rearranged movie list as a JSON array, prioritizing movies with genres from the user's watchlist, and placing the watchlist movies at the beggining of the list.
    `;
    const result = await model.generateContent(prompt);
    console.log(result,"result")
    const response = await result.response;
    const text = response.text();

    const startIndex = text.indexOf('[');
    const endIndex = text.lastIndexOf(']');
    if (startIndex === -1 || endIndex === -1) {
      console.error("Could not find JSON array in response.");
      return [];
    }
    const jsonString = text.substring(startIndex, endIndex + 1);
    const rearrangedMovies = JSON.parse(jsonString);
    // console.log(rearrangedMovies,"rearrangedMovies")
    res.status(200).json({
      message: "AI recomdation added successfully!",
      videos: rearrangedMovies,
    });
    // return rearrangedMovies;
  } catch (error) {
    console.log(error,"error")
    res.status(500).json({
      message: "Error getting recommended movies",
      error,
    });
  }
});

export default aiRouter;
