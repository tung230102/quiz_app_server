const upload = require("../utils/multer");
const cloudinary = require("../utils/cloudinary");
const Question = require("../models/questionModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.uploadQuestionThumbnail = upload.single("thumbnail");

exports.uploadThumbnail = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload an image file", 400));
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "questions",
  });

  res.status(200).json({
    message: "Upload thumbnail success!",
    data: result.secure_url,
    statusCode: 200,
  });
});

exports.getAllQuestions = factory.getAll(Question);
exports.getQuestion = factory.getOne(Question);
exports.createQuestion = factory.createOne(Question);
exports.updateQuestion = factory.updateOne(Question);
exports.deleteQuestion = factory.deleteOne(Question);

exports.getQuestionsPlay = catchAsync(async (req, res) => {
  const totalQuestions = req.query.total * 1;
  const category = req.query.category;
  const difficulty = req.query.difficulty;

  const matchCriteria = {};
  if (category) matchCriteria.category = category;
  if (difficulty) matchCriteria.difficulty = difficulty;

  const randomQuestions = await Question.aggregate([
    { $match: matchCriteria },
    { $sample: { size: totalQuestions } },
  ]);

  const doc = await Promise.all(
    randomQuestions.map(async (question) => {
      const populatedQuestion = await Question.populate(question, {
        path: "answers",
        select: "_id content",
      });
      return {
        category,
        difficulty,
        id: populatedQuestion._id,
        title: populatedQuestion.title,
        thumbnail_link: populatedQuestion.thumbnail_link,
        answers: populatedQuestion.answers.map((answer) => ({
          id: answer._id,
          content: answer.content,
        })),
      };
    })
  );

  res.status(200).json({
    status: "success",
    statusCode: 200,
    results: doc.length,
    data: {
      data: doc,
    },
  });
});

exports.submitQuestions = catchAsync(async (req, res, next) => {
  const listQuestionSubmitted = req.body.listQuestionSubmitted;

  const questions = await Question.find({
    _id: { $in: listQuestionSubmitted.map((q) => q.id) },
  }).populate("answers");

  let totalScore = 0;
  let maxScore = 10;

  const listQuestionChecked = questions.map((question) => {
    const submittedQuestion = listQuestionSubmitted.find(
      (submitted) => submitted.id === question.id
    );

    const answers = question.answers.map((answer) => {
      const isSubmitCorrect = submittedQuestion.answersSubmittedId.includes(
        answer._id.toString()
      );
      return {
        id: answer._id,
        content: answer.content,
        is_correct: answer.is_correct,
        is_submit_correct: isSubmitCorrect,
      };
    });

    const isAllCorrect = answers.every(
      (answer) => answer.is_correct === answer.is_submit_correct
    );

    const scoreThisQuestion = isAllCorrect ? maxScore / questions.length : 0;
    totalScore += scoreThisQuestion;

    return {
      id: question.id,
      title: question.title,
      thumbnail_link: question.thumbnail_link,
      answers,
    };
  });

  res.status(200).json({
    statusCode: 200,
    data: {
      listQuestionChecked,
      totalScore,
    },
  });
});
