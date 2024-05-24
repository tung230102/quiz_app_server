const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Answer can not be empty!"],
    },
    questionId: {
      type: mongoose.Schema.ObjectId,
      ref: "Question",
      required: [true, "Answer must belong to a question"],
    },
    is_correct: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

answerSchema.index({ questionId: 1 }, { unique: true });

answerSchema.pre(/^find/, function (next) {
  next();
});

const Answer = mongoose.model("Answer", answerSchema);

module.exports = Answer;
