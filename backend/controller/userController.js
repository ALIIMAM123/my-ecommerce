const ErrorHandler = require("../utils/errorhandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// Register a User

exports.RegisterUser = catchAsyncErrors(async (req, res, next) => {
	const { name, email, password } = req.body;

	const user = await User.create({
		name,
		email,
		password,
		avatar: {
			public_id: "this is a  sample id",
			url: "profilePicUrl",
		},
	});

	// const token = user.getJWTToken();

	// res.status(201).json({
	// 	success: true,
	// 	// user,    remove it
	// 	token,
	// });
	sendToken(user, 201, res);
});

// Login User

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
	const { email, password } = req.body;

	// checking if user has given password and email both
	if (!email || !password) {
		return next(new ErrorHandler("Please Enter Email & Password ", 400));
	}

	const user = await User.findOne({ email: email }).select("+password");

	if (!user) {
		return next(new ErrorHandler("Invalid email or password ", 401));
	}

	const isPasswordMatched = await user.comparePassword(password);

	if (!isPasswordMatched) {
		return next(new ErrorHandler("Invalid email or password", 401));
	}

	// const token = user.getJWTToken();

	// res.status(200).json({
	// 	success: true,
	// 	token,
	// });

	sendToken(user, 200, res);
});

// Logout user
exports.logout = catchAsyncErrors(async (req, res, next) => {
	res.cookie("token", null, {
		expires: new Date(Date.now()),
		httpOnly: true,
	});

	res.status(200).json({
		success: true,
		message: "Logged Out Successfully",
	});
});

// Forgot Password

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ErrorHandler("User not Found", 404));
	}

	// Get ResetPasswordToken
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	const resetPasswordUrl = `${req.protocol}://${req.get(
		"host",
	)}/api/v1/password/reset/${resetToken}`;

	const message = `Your Password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then ,please ignore it`;

	try {
		await sendEmail({
			email: user.email,
			subject: `Ecommerce Password Recovery`,
			message: message,
		});

		res.status(200).json({
			success: true,
			message: `Email sent to ${user.email} successfully`,
		});
	} catch (error) {
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });
		return next(new ErrorHandler(error.message, 500));
	}
});

// RESET PASSWORD

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
	// creating token hash

	const resetPasswordToken = crypto
		.createHash("sha256")
		.update(req.params.token)
		.digest("hex");

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() },
	});

	if (!user) {
		return next(
			new ErrorHandler(
				"Reset Password Token is invalid or has been expired",
				404,
			),
		);
	}

	if (req.body.password !== req.body.confirmPassword) {
		return next(new ErrorHandler("Password does not match "));
	}

	user.password = req.body.password;

	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	await user.save();

	sendToken(user, 200, res);
});

// Get User Details

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user.id);

	res.status(200).json({
		success: true,
		user,
	});
});

// Update User password

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.user.id).select("+password");

	const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

	if (!isPasswordMatched) {
		return next(new ErrorHandler("Old Password is Incorrect", 400));
	}

	if (req.body.newPassword !== req.body.confirmPassword) {
		return next(new ErrorHandler("Password doesnot match", 400));
	}

	user.password = req.body.newPassword;
	await user.save();
	sendToken(user, 200, res);

	res.status(200).json({
		success: true,
		user,
	});
});

// Update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
	const newUserData = {
		name: req.body.name,
		email: req.body.email,
	};

	// We will add cloudinary later
	const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
		new: true,
		runValidators: true,
		useFindAndModify: false,
	});

	res.status(200).json({
		success: true,
	});
});

// Get All Users (admin)
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
	const users = await User.find();

	res.status(200).json({
		success: true,
		users,
	});
});

// Get Single User (admin) Admin can see details of any user
exports.getSingleUsers = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(
			new ErrorHandler(`User does not exis with Id ${req.params.id}`),
		);
	}

	res.status(200).json({
		success: true,
		user,
	});
});

// Update User Role --Admin (admin can change role of user)
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
	const newUserData = {
		name: req.body.name,
		email: req.body.email,
		role: req.body.role,
	};

	const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
		new: true,
		runValidators: true,
		useFindAndModify: false,
	});

	res.status(200).json({
		success: true,
	});
});

// Delete User -- Admin (admin can delete any user)
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	// We will remove cloudinary later

	if (!user) {
		return next(
			new ErrorHandler(`User does not exist with Id: ${req.params.id} ,400`),
		);
	}

	await user.remove();

	res.status(200).json({
		success: true,
		message: "User Deleted Successfully",
	});
});
