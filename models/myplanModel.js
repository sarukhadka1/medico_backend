const mongoose = require('mongoose');

const myPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  doctors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctors", 
    required: true
  }]
});

const MyPlan = mongoose.model('my_plan', myPlanSchema);
module.exports = MyPlan;
