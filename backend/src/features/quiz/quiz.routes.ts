import { Router } from "express";
import { authUser } from "../../middleware/authUser.js";
import { generateQuiz } from "./quiz.controllers.js";
const router=Router();

router.get("/generatequiz/:slug",authUser,generateQuiz);


export default router;