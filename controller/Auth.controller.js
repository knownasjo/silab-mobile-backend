const createError = require("http-errors");
const User = require("../models/User.model");
const {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} = require("../helpers/validation_schema");
const { signAccessToken } = require("../helpers/jwt_helper");
const bcrypt = require("bcrypt");
const Otp = require("../models/Otp.model");
const mailSender = require("../helpers/email_transporter");
const SelectedSubject = require("../models/SelectedSubject.model");
const { supabase } = require("../helpers/init_supabase");

async function register(req, res, next) {
  try {
    const result = await registerSchema.validateAsync(req.body);

    const doesExist = await User.findOne({ email: result.email });
    if (doesExist)
      throw createError.Conflict(`${result.email} is already been registered.`);

    const user = new User(result);
    await user.save().then((result) => {
      sendOtpVerificationEmail(result, res, next);
    });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await loginSchema.validateAsync(req.body);
    const user = await User.findOne({ email: result.email });
    if (!user) throw createError.NotFound("User not registered");

    const isMatch = await user.isValidPassword(result.password);
    if (!isMatch)
      throw createError.Unauthorized("Either Email / Password is Incorrect");

    const accessToken = await signAccessToken(user.id);

    const response = {
      status: 200,
      message: "success",
      data: {
        email: user.email,
        nim: user.nim,
        token: accessToken,
      },
    };

    res.send(response);
  } catch (error) {
    if (error.isJoi === true)
      return next(createError.BadRequest("Invalid Email / Password"));

    next(error);
  }
}

async function sendOtpVerificationEmail({ _id, email }, res, next) {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    const isUserExist = await User.findOne({ email: email });
    if (!isUserExist)
      throw createError.NotFound(`User with Email : ${email} is Not Found`);

    await Otp.deleteMany({ userId: isUserExist._id });

    const newOtp = new Otp({
      userId: _id,
      otp: hashedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 180000,
    });
    await newOtp.save();

    await mailSender(
      email,
      "Email Verification",
      `<p> Enter OTP Code below to verify your email address </p> <br/>
    <p><b>${otp}<b></p>
  `
    );

    const response = {
      status: 200,
      message: "Verification OTP email sent",
      data: {
        userId: _id,
        email: email,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function resendOtpVerificationEmail(req, res, next) {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) throw createError.Conflict("Empty user details");

    await Otp.deleteMany({ userId });
    sendOtpVerificationEmail({ _id: userId, email }, res, next);
  } catch (error) {
    next(error);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      throw createError.Conflict("Empty OTP details");
    } else {
      const userOtp = await Otp.findOne({ userId });
      if (!userOtp) createError.NotFound("User OTP Not Found");

      const expiresAt = userOtp.expiresAt;
      const hashedOtp = userOtp.otp;

      if (expiresAt < Date.now()) {
        await Otp.deleteMany({ userId });
        throw createError.NotFound(
          "OTP Code has expired, please request for a new one"
        );
      } else {
        const validOtp = await bcrypt.compare(otp, hashedOtp);

        if (!validOtp) throw createError.Conflict("Invalid OTP Code");

        await User.updateOne({ _id: userId }, { verified: true });
        await Otp.deleteMany({ userId });

        const selectedSubject = new SelectedSubject({ userId: userId });
        await selectedSubject.save();

        res.json({
          status: 200,
          message: "user verified",
        });
      }
    }
  } catch (error) {
    next(error);
  }
}

async function resetPassword(req, res, next) {
  try {
    const result = await resetPasswordSchema.validateAsync(req.body);

    const user = await User.findById(result.userId);
    if (!user) throw createError.NotFound("User Not Found.");

    const isPasswordIdentical = await bcrypt.compare(
      result.newPassword,
      user.password
    );
    if (isPasswordIdentical)
      throw createError.Conflict("Old Password and New Password is Identical");

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(result.newPassword, salt);

    await User.findByIdAndUpdate(result.userId, {
      $set: {
        password: newHashedPassword,
      },
    });

    const response = {
      status: 200,
      message: "password changed successfuly",
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function sendResetPasswordOtp(req, res, next) {
  try {
    const { email } = req.body;

    const emailExists = await User.findOne({ email: email });
    if (!emailExists)
      throw createError.NotFound("User with Given Email Not Found");

    const userId = emailExists._id;

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);

    await Otp.deleteMany({ userId: userId });

    const newOtp = new Otp({
      userId: userId,
      otp: hashedOtp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 180000,
    });
    await newOtp.save();

    await mailSender(
      email,
      "Password Reset Verification",
      `<p> This OTP Code is used for resetting your password. </p> <br/>
      <p><b>${otp}<b></p>
    `
    );

    const response = {
      status: 200,
      message: "Password Reset OTP Sent",
      data: {
        userId: userId,
        email: email,
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

async function resendResetPasswordOtp(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) throw createError.Conflict("Empty user details");

    const isUserExist = await User.findOne({ email: email });
    if (!isUserExist)
      throw createError.NotFound(`User with Email : ${email} is Not Found`);

    await Otp.deleteMany({ userId: isUserExist._id });
    sendResetPasswordOtp(req, res, next);
  } catch (error) {
    next(error);
  }
}

async function verifyResetPasswordOtp(req, res, next) {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      throw createError.Conflict("Empty OTP details");
    } else {
      const userOtp = await Otp.findOne({ userId });
      if (!userOtp) createError.NotFound("User OTP Not Found");

      const expiresAt = userOtp.expiresAt;
      const hashedOtp = userOtp.otp;

      if (expiresAt < Date.now()) {
        await Otp.deleteMany({ userId });
        throw createError.NotFound(
          "OTP Code has expired, please request for a new one"
        );
      } else {
        const validOtp = await bcrypt.compare(otp, hashedOtp);

        if (!validOtp) throw createError.Conflict("Invalid OTP Code");

        await Otp.deleteMany({ userId });

        res.json({
          status: 200,
          message: "verified",
        });
      }
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  verifyOtp,
  resendOtpVerificationEmail,
  resendResetPasswordOtp,
  resetPassword,
  verifyResetPasswordOtp,
  sendResetPasswordOtp,
};
