const express = require("express");
const router = express.Router();
const { addReview, getReviewsByDoctor } = require("../controllers/reviewController");
const { authGuard } = require("../Middleware/authGuard"); // Adjusted path for middleware import

// POST route to add a review
router.post("/add", authGuard, addReview); // Added authGuard to ensure user is authenticated

// GET route to fetch reviews by doctor ID
router.get("/doctor/:doctorId", getReviewsByDoctor);

module.exports = router;
