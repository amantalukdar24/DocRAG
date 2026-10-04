import { Request, Response } from "express";
import { llmText } from "../../services/langchain.js";
import DOC from "../documents/doc.model.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { loadPdfText } from "../../services/pdfparse.js";



const generateQuiz = async (req: Request, res: Response): Promise<any> => {
    try {
        const pdfDetails = await DOC.findOne({ uploadedBy: req?.user?._id, _id: req.params.slug });
        if (!pdfDetails) return res.status(404).json({ success: false, mssg: "Document not found" });

        const text = await loadPdfText(pdfDetails.path);
        if (!text || !text.trim()) {
            return res.status(400).json({ success: false, mssg: "Unable to extract text content from the selected PDF." });
        }

        const prompt = ChatPromptTemplate.fromTemplate(`
Create 10 MCQs on {topic}: 3 easy, 4 moderate, 3 hard.
Each question must have 4 options and 1 correct answer.
Return only a JSON array:
[[{{"question":"","options":["","","",""],"answer":""}}]]
`);
        const chain = await prompt.pipe(llmText).pipe(new StringOutputParser());
        const quizData = await chain.invoke({ topic: text.slice(0, 15000) });
        
        return res.status(200).json({ success: true, quizData });

    } catch (err: any) {
        console.error("Quiz Generation Error:", err);
        if (err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("Quota")) {
            return res.status(429).json({
                success: false,
                mssg: "Gemini API rate limit reached. Please wait a few seconds and try again."
            });
        }
        return res.status(500).json({ success: false, mssg: err?.message || "Internal Server Error" });
    }
};

export { generateQuiz };