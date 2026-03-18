const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Admin = require("../models/Admin");
const Farmer = require("../models/Farmer");
const Consumer = require("../models/Consumer");
const generateToken = require("../utils/generateToken");

const modelByRole = {
  admin: Admin,
  farmer: Farmer,
  consumer: Consumer,
};

const resettableModelByRole = {
  farmer: Farmer,
  consumer: Consumer,
};

const logAuthEvent = (event, details = {}) => {
  console.log(`[AUTH] ${event}`, details);
};

const buildAuthResponse = (user, role) => {
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.resetPasswordToken;
  delete safeUser.resetPasswordExpires;

  return {
    user: {
      ...safeUser,
      role,
    },
    token: generateToken({ id: user._id, role, email: user.email }),
  };
};

const findUserByEmail = async (email) => {
  for (const [role, Model] of Object.entries(modelByRole)) {
    const user = await Model.findOne({ email });
    if (user) {
      return { user, role };
    }
  }

  return null;
};

const createUser = async (role, payload) => {
  const Model = modelByRole[role];

  if (!Model) {
    throw new Error("Invalid role");
  }

  const existingUser = await findUserByEmail(payload.email);
  if (existingUser) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const user = await Model.create({
    ...payload,
    password: hashedPassword,
  });

  return user;
};

exports.register = async (req, res, next) => {
  try {
    const { role = "consumer", email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required." });
    }

    if (!["consumer", "farmer"].includes(role)) {
      return res
        .status(400)
        .json({ msg: "Role must be either consumer or farmer." });
    }

    const user = await createUser(role, req.body);

    if (!user) {
      logAuthEvent("register_conflict", { role, email });
      return res.status(409).json({ msg: "An account with this email already exists." });
    }

    logAuthEvent("register_success", { role, email, userId: user._id.toString() });
    res.status(201).json(buildAuthResponse(user, role));
  } catch (err) {
    console.error("[AUTH] register_error", err.message);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email and password are required." });
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      logAuthEvent("login_failed_user_not_found", { email });
      return res.status(401).json({ msg: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      existingUser.user.password
    );

    if (!passwordMatches) {
      logAuthEvent("login_failed_bad_password", {
        email,
        role: existingUser.role,
      });
      return res.status(401).json({ msg: "Invalid email or password." });
    }

    logAuthEvent("login_success", {
      email,
      role: existingUser.role,
      userId: existingUser.user._id.toString(),
    });
    res.json(buildAuthResponse(existingUser.user, existingUser.role));
  } catch (err) {
    console.error("[AUTH] login_error", err.message);
    next(err);
  }
};

exports.setupAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ msg: "Name, email, and password are required." });
    }

    const adminExists = await Admin.exists({});
    if (adminExists) {
      logAuthEvent("setup_admin_blocked", { email });
      return res.status(403).json({ msg: "An admin account has already been created." });
    }

    const admin = await createUser("admin", {
      name,
      email,
      password,
      phone,
    });

    if (!admin) {
      logAuthEvent("setup_admin_conflict", { email });
      return res.status(409).json({ msg: "An account with this email already exists." });
    }

    logAuthEvent("setup_admin_success", {
      email,
      userId: admin._id.toString(),
    });
    res.status(201).json(buildAuthResponse(admin, "admin"));
  } catch (err) {
    console.error("[AUTH] setup_admin_error", err.message);
    next(err);
  }
};

exports.createFarmerByAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone, farmName, location } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ msg: "Name, email, and password are required." });
    }

    const farmer = await createUser("farmer", {
      name,
      email,
      password,
      phone,
      farmName,
      location,
    });

    if (!farmer) {
      logAuthEvent("admin_create_farmer_conflict", {
        adminId: req.user?.id,
        email,
      });
      return res.status(409).json({ msg: "An account with this email already exists." });
    }

    logAuthEvent("admin_create_farmer_success", {
      adminId: req.user?.id,
      farmerId: farmer._id.toString(),
      email,
    });
    res.status(201).json({
      msg: "Farmer created successfully.",
      ...buildAuthResponse(farmer, "farmer"),
    });
  } catch (err) {
    console.error("[AUTH] admin_create_farmer_error", err.message);
    next(err);
  }
};

exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { role, email } = req.body;

    if (!role || !email) {
      return res.status(400).json({ msg: "Role and email are required." });
    }

    const Model = resettableModelByRole[role];

    if (!Model) {
      return res
        .status(400)
        .json({ msg: "Password reset is only available for farmer or consumer." });
    }

    const user = await Model.findOne({ email });

    if (!user) {
      logAuthEvent("password_reset_request_user_not_found", { role, email });
      return res.status(404).json({ msg: "No account was found for this email." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    logAuthEvent("password_reset_requested", {
      role,
      email,
      userId: user._id.toString(),
    });

    res.json({
      msg: "Password reset token generated successfully.",
      resetToken,
      expiresAt: user.resetPasswordExpires,
    });
  } catch (err) {
    console.error("[AUTH] password_reset_request_error", err.message);
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { role, token, newPassword } = req.body;

    if (!role || !token || !newPassword) {
      return res
        .status(400)
        .json({ msg: "Role, token, and new password are required." });
    }

    const Model = resettableModelByRole[role];

    if (!Model) {
      return res
        .status(400)
        .json({ msg: "Password reset is only available for farmer or consumer." });
    }

    const user = await Model.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      logAuthEvent("password_reset_failed_invalid_token", { role });
      return res.status(400).json({ msg: "The reset token is invalid or has expired." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    logAuthEvent("password_reset_success", {
      role,
      userId: user._id.toString(),
      email: user.email,
    });

    res.json({ msg: "Password reset successful." });
  } catch (err) {
    console.error("[AUTH] password_reset_error", err.message);
    next(err);
  }
};
