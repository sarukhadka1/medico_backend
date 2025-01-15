const Reviews = require("../models/reviewModel");

exports.addReview = async (req, res) => {
    const { doctorId, rating, comment } = req.body; // Changed artistId to doctorId
    const userId = req.user._id; // Ensure req.user is populated from authentication middleware

    try {
        const review = new Reviews({ doctorId, userId, rating, comment }); // Updated field name to doctorId
        await review.save();
        res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
        res.status(500).json({ message: "Failed to add review", error });
    }
};

exports.getReviewsByDoctor = async (req, res) => { // Changed function name to reflect "doctor"
    console.log(req.params.doctorId); // Changed artistId to doctorId
    const doctorId = req.params.doctorId; // Updated parameter name

    try {
        const reviews = await Reviews.find({ doctorId: doctorId }); // Updated field name to doctorId
        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch reviews", error });
    }
};
