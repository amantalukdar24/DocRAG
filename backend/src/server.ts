import "./polyfill.js";
import express from "express";
import dotenv from "dotenv";
import authRouter from "./features/auth/auth.routes.js";
import docRouter from "./features/documents/doc.routes.js";
import quizRouter from "./features/quiz/quiz.routes.js";
import dbConfig from "./dbConfig.js";
import cors from "cors";
import chatsRouter from "./features/askAI/chats.router.js";
dotenv.config();

const app = express();
const PORT: number = Number(process.env.PORT) || 8000;
dbConfig();

// Body parser and CORS middleware MUST be registered BEFORE routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use("/auth", authRouter);
app.use("/doc",docRouter);
app.use("/quiz",quizRouter);
app.use("/chat",chatsRouter);
app.listen(PORT, (): void => {
    console.log(`Server Running on PORT:${PORT}`);
});