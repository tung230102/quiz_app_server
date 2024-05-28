const mongoose = require("mongoose");
const slugify = require("slugify");

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A question have a title"],
      unique: true,
      trim: true,
      minlength: [
        10,
        "A question title must have more or equal then 10 characters",
      ],
    },
    slug: String,
    category: {
      type: String,
      required: [true, "A question have a category"],
      default: "other",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: [true, "A question have a difficulty"],
      default: "easy",
    },
    thumbnail_link: String,
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

questionSchema.index({ slug: 1 });

// Virtual populate
questionSchema.virtual("answers", {
  ref: "Answer",
  foreignField: "questionId",
  localField: "_id",
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
questionSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

questionSchema.pre(/^find/, function (next) {
  this.populate({
    path: "answers",
    select: "-__v",
  });

  next();
});

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
