const mongoose = require("mongoose");

const intakeSchema = mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId
  },
  userId: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  kcal: {
    type: Number,
    required: true
  },
  protein: {
    type: Number,
    required: true
  },
  carbs: {
    type: Number,
    required: true
  }
});

const Intake = mongoose.model("Intake", intakeSchema);

module.exports = Intake;