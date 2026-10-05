import {Request,Response} from "express";
import { llmText,embeddings } from "../../services/langchain.js";
import qdrantClient, { COLLECTION_NAME, ensureCollection } from "../../qdrantConfig.js";
import CHATS from "./chats.models.js";
import DOC from "../documents/doc.model.js";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import { Types } from "mongoose";

const getAnswer=async (req:Request,res:Response):Promise<any>=>{
    try {
        const question:string=req.body.question;
        const docId=req.body.docId;
        const document=await DOC.findById(docId);
        if(!document) return res.status(404).json({success:false,mssg:"Document Not Found"});
        
        let queryVector: number[] = [];
        try {
            queryVector = await embeddings.embedQuery(question);
        } catch (embedErr) {
            console.error("embedQuery failed, falling back to embedDocuments:", embedErr);
            const vectors = await embeddings.embedDocuments([question]);
            queryVector = vectors[0] || [];
        }

        if (!Array.isArray(queryVector) || queryVector.length === 0) {
            return res.status(400).json({ success: false, mssg: "Failed to generate question vector" });
        }

        await ensureCollection(queryVector.length);

        const collectionInfo = await qdrantClient.collectionExists(COLLECTION_NAME);
        let documents = "";

        if (collectionInfo.exists) {
            const result = await qdrantClient.query(COLLECTION_NAME, {
                query: queryVector,
                limit: 5,
                filter: {
                    must: [
                        {
                            key: "documentId",
                            match: {
                                value: docId
                            }
                        }
                    ]
                },
                with_payload: true
            });

            documents = result.points
                .map((pt) => pt.payload?.text as string)
                .filter(Boolean)
                .join("\n\n");
        }

        const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful assistant that answers questions based on the provided document.

Question:
{question}

Document:
{document}

Instructions:
1. Answer the question using only the information provided in the document.
2. Structure the answer with a clear heading and bullet points where appropriate.
3. Explain concepts clearly and directly.
4. If the document does not contain enough information, state that clearly.
5. Do not invent facts or include unrelated information.
6. Return the answer in a well-structured, readable format.
`);

const chain = prompt.pipe(llmText);
const response=await chain.invoke({
    question:question,document:documents
})
if(response){
const storeAnswer=await CHATS.create({
    question,
    answer:response.content.toString(),
    docId:docId

});
if(storeAnswer) return res.status(200).json({success:true,storeAnswer})
}
  return res.status(400).json({success:false,mssg:"Something Went Wrong"});

        
    } catch (err) {
        console.log(err);
        return res.status(500).json({status:false,mssg:"Internal Server Down"});
    }
}

const getRecentsChats=async (req:Request,res:Response):Promise<any>=>{
    try {
        const docId:string=req.params.docId as string;
        const document=await DOC.findById(docId);
        if(!document) return res.status(404).json({success:false,mssg:"Document Not Found"});
        const chats=await CHATS.find({docId:docId}).sort({createdAt:1});
        return res.status(200).json({success:true,chats});
    } catch (err) {
        console.log(err);
        return res.status(500).json({status:false,mssg:"Internal Server Down"});
    }
}

const clearChats=async (req:Request,res:Response):Promise<any>=>{
    try {
        const docId=req.body.docId;
        
        await CHATS.deleteMany({docId:new Types.ObjectId(docId)});
        return res.status(200).json({success:true,mssg:"Chats Deleted"});
    } catch (err) {
         console.log(err);
         return res.status(500).json({success:false,mssg:"Internal Server Down"});
    }
}

export {getAnswer,clearChats,getRecentsChats};