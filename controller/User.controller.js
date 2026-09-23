const {
  supabase,
  handlePaymentStatusChange,
} = require("../helpers/init_supabase");
const User = require("../models/User.model");
const createError = require("http-errors");

async function getAllUsers(req, res, next) {
  try {
    const { role, paid } = req.query;

    let users;

    if (role) {
      users = await User.find({ role: role });
    }

    if (paid) {
      users = await User.find({ paid: paid });
    }

    if (!role && !paid) {
      users = await User.find();
    }

    const response = {
      status: 200,
      message: "success",
      data: users,
    };
    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function getAssistants(req, res, next) {
  const { query } = req.query;

  try {
    let users;

    if (query) {
      const regex = new RegExp(query, "i");
      users = await User.find({
        role: { $elemMatch: { $eq: "asisten" } },
        fullname: regex,
      });
    } else {
      users = await User.find({
        role: { $elemMatch: { $eq: "asisten" } },
      });
    }

    const response = {
      status: 200,
      message: "success",
      data: users,
    };
    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function getLecturer(req, res, next) {
  const { query } = req.query;

  try {
    let users;

    if (query) {
      const regex = new RegExp(query, "i");
      users = await User.find({
        role: { $elemMatch: { $eq: "dosen" } },
        fullname: regex,
      });
    } else {
      users = await User.find({
        role: { $elemMatch: { $eq: "dosen" } },
      });
    }

    const response = {
      status: 200,
      message: "success",
      data: users,
    };
    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function getUserByNim(req, res, next) {
  try {
    const { nim } = req.params;
    const user = await User.findOne({ nim: nim });

    if (!user) throw createError.NotFound();

    const response = {
      status: 200,
      message: "success",
      data: user,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

async function updatePaymentStatus(req, res, next) {
  try {
    const { nim } = req.params;

    const user = await User.findOne({ nim: nim });
    if (!user) throw createError.NotFound("User not found.");

    const updatedUser = await User.findOneAndUpdate(
      { nim: nim },
      { $set: { paid: true } },
      { returnOriginal: false }
    );

    const channel = supabase.channel(user.nim);

    const { error } = await supabase
      .from("users")
      .update({ payment_status: true })
      .eq("nim", user.nim)
      .select();

    await handlePaymentStatusChange(nim);

    const response = {
      status: 200,
      message: "success",
      data: updatedUser,
    };

    res.send(response);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllUsers,
  getUserByNim,
  updatePaymentStatus,
  getAssistants,
  getLecturer,
};
