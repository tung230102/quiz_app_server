const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      message: `Delete success!`,
      statusCode: 200,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      message: `Update success!`,
      data: {
        data: doc,
      },
      statusCode: 200,
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: "success",
      message: `Create success!`,
      data: {
        data: doc,
      },
      statusCode: 201,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError("No document found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      message: `Get By Id success!`,
      data: {
        data: doc,
      },
      statusCode: 200,
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.questionId) filter = { questionId: req.params.questionId };

    if (req.query.keyWord) {
      filter.$or = [
        { title: { $regex: req.query.keyWord, $options: "i" } },
        { name: { $regex: req.query.keyWord, $options: "i" } },
        { email: { $regex: req.query.keyWord, $options: "i" } },
      ];
    }

    // Filtering by role1 and role2
    if (req.query.role1 || req.query.role2) {
      filter.roles = {
        $in: [req.query.role1, req.query.role2].filter((role) => role),
      };
    }

    // Getting the total number of documents
    const totalDocuments = await Model.countDocuments(filter);

    // Extracting limit and page from query parameters
    const size = req.query.size * 1 || 10;
    const page = req.query.page * 1 || 1;

    // Calculating total pages
    const totalPages = Math.ceil(totalDocuments / size);

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // const doc = await features.query.explain();
    const doc = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: "success",
      results: doc.length,
      message: `Get all success!`,
      data: {
        result: doc,
        totalPages,
        currentPage: page,
      },
      statusCode: 200,
    });
  });
