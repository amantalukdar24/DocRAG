import { Router } from "express";
import { registerUser, loginUser } from "./auth.controller.js";
import { validateSignup } from "../../middleware/validateInput.js";

const router = Router();

router.post("/register", validateSignup, registerUser);
router.post("/login", loginUser);

export default router;