import express from "express";
const userRouter = express.Router();
import { getcurrentUser } from "../controllers/user.controller.js";
import isAuth from "../middleware/auth.middleware.js";
userRouter.get("/current", isAuth, getcurrentUser);

export default userRouter;
