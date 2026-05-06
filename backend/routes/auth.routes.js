import express from "express";
const authRouter = express.Router();

import { googleAuth, logout, sendOtp } from "../controllers/auth.controller.js";

authRouter.post("/google", googleAuth);
authRouter.get("/logout", logout);
authRouter.post("/send-email", sendOtp);

export default authRouter;
