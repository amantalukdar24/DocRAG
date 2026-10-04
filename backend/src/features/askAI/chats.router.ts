import {Router} from "express";
import { authUser } from "../../middleware/authUser.js";
import { getAnswer,clearChats,getRecentsChats} from "../askAI/chats.controllers.js";
const router=Router();

router.post("/getanswer",authUser,getAnswer);
router.delete("/deletechats",authUser,clearChats);
router.get("/getchats/:docId",authUser,getRecentsChats);

export default router;