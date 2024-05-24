const express = require("express");
const questionController = require("../controllers/questionController");
const authController = require("../controllers/authController");
const answerRoutes = require("./../routes/answerRoutes");

const router = express.Router();

router.use("/:questionId/answers", answerRoutes);

router
  .route("/play")
  .get(questionController.getQuestionsPlay, questionController.getAllQuestions);

router.route("/submit").post(questionController.submitQuestions);

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo("admin")); // permission for admin only

router.post(
  "/upload-thumbnail",
  questionController.uploadQuestionThumbnail,
  questionController.uploadThumbnail
);

router
  .route("/")
  .get(questionController.getAllQuestions)
  .post(questionController.createQuestion);

router
  .route("/:id")
  .get(questionController.getQuestion)
  .patch(questionController.updateQuestion)
  .delete(questionController.deleteQuestion);

module.exports = router;
