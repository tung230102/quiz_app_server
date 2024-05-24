const express = require("express");
const answerController = require("../controllers/answerController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);
router.use(authController.restrictTo("admin")); // permission for admin only

router
  .route("/")
  .get(answerController.getAllAnswers)
  .post(answerController.setQuestionId, answerController.createAnswer);

router
  .route("/:id")
  .get(answerController.getAnswer)
  .patch(answerController.updateAnswer)
  .delete(answerController.deleteAnswer);

module.exports = router;
