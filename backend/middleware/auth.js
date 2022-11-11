const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const user = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
	const { token } = req.cookies;
	// console.log(token);

	if (!token) {
		return next(new ErrorHandler("Please Login to access this resource", 401));
	}
	const decodedData = jwt.verify(token, process.env.JWT_SECRET);
	console.log(decodedData, "hello");

	req.user = await user.findById(decodedData.id);
	next();
});

exports.authorizeRoles = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new ErrorHandler(
					`Role: ${req.user.role} is not allowed to access ths resource`,
					403,
				),
			);
		}

		next();
	};
};
