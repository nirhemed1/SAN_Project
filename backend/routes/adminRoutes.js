import express from "express";
import bcrypt from "bcryptjs";
import expressAsyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import { isAuth, isAdmin } from "../utils.js";
import Order from "../models/orderModel.js";

const adminRouter = express.Router();

adminRouter.get("/userlist", isAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({});
    console.log(users);
    res.send(users);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

adminRouter.get("/orderlist", isAuth, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find({});
    console.log(orders);
    res.send(orders);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default adminRouter;
