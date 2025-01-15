const express = require("express");
const router = express.Router();
const myPlanController = require("../controllers/myplanController");
const { authGuard } = require("../Middleware/authGuard");

// Add to My Plan
router.post("/add", authGuard, myPlanController.addToMyPlan);

// Get all items in My Plan
router.get("/all", authGuard, myPlanController.getUserMyPlan);

// Remove from My Plan
router.delete("/remove/:doctorId", authGuard, myPlanController.removeFromMyPlan);

module.exports = router;
