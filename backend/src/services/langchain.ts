import { ChatGoogleGenerativeAI,GoogleGenerativeAIEmbeddings  } from "@langchain/google-genai";
import dotenv from "dotenv";
dotenv.config();
const llmText=new ChatGoogleGenerativeAI({
        "model":"gemini-3.5-flash-lite",
        "apiKey":process.env.Gemini_ApiKey as string,
        
});
const embeddings=new GoogleGenerativeAIEmbeddings({
        "model":"gemini-embedding-001",
        "apiKey":process.env.Gemini_ApiKey as string
})

export {llmText,embeddings};