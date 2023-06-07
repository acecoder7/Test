import express from "express";
import User from "../models/User.js";
import passport from "passport";

const router = express.Router();

// Protected route that requires authentication
router.get("/profile", isAuthenticated, (req, res) => {
  // Access the authenticated user from req.user
  res.json({ user: req.user });
});

// Check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export default router;



  