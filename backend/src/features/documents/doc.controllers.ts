import { Request, Response } from "express";
import { loadPdfText } from "../../services/pdfparse.js";
import { v2 as cloudinary } from "cloudinary";
import DOC from "./doc.model.js";
import { embeddings } from "../../services/langchain.js";
import qdrantClient, { COLLECTION_NAME, ensureCollection } from "../../qdrantConfig.js";
import CHATS from "../askAI/chats.models.js";
import crypto from "crypto";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});


const uploadFile = async (req: Request, res: Response): Promise<any> => {
    try {
       
        if (!req?.user?._id) return res.status(400).json({ success: false, mssg: "Unauthorized Access" });
        if (!req.file) return res.status(404).json({ success: false, mssg: "File Not Found" });
         
        const upload = await DOC.create({
            publicId: req.file.filename,
            path: req.file.path,
            uploadedBy: req?.user._id
        });
        const pdfText = await loadPdfText(upload.path);
        const splitter = pdfText
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean);

        if (splitter.length > 0) {
          const vectors: any = await embeddings.embedDocuments(splitter);
          const vectorSize = vectors[0]?.length || 768;
          await ensureCollection(vectorSize);

          const points = splitter.map((chunk, index) => ({
            id: crypto.randomUUID(),
            vector: vectors[index],
            payload: {
              documentId: upload._id.toString(),
              uploadedBy: upload.uploadedBy.toString(),
              text: chunk,
              chunkIndex: index,
            },
          }));

          await qdrantClient.upsert(COLLECTION_NAME, {
            wait: true,
            points,
          });
        }

        return res.status(201).json({
            success: true,
            mssg: "PDF Uploaded"
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, mssg: "Internal Server Down" });
    }
}
const getUserDocument = async (req: Request, res: Response): Promise<any> => {
    try {
        const getDocuments = await DOC.find({ uploadedBy: req?.user?._id }).sort({createdAt:-1}).skip(Number(req?.query?.skip) * 10).limit(10);
        return res.status(200).json({ success: true, getDocuments });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, mssg: "Internal Server Down" });
    }
}
const getTotalDocuments=async (req:Request,res:Response):Promise<any>=>{
    try {
        const total=await DOC.find({uploadedBy:req?.user?._id}).countDocuments();
        return res.status(200).json({success:true,total});
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, mssg: "Internal Server Down" });
    }
}

const deletePdf=async (req:Request,res:Response):Promise<any>=>{
    try {
        const result=await cloudinary.uploader.destroy(req.body.publicId,{resource_type:"raw"});
        if(result){
          const data=await DOC.findOneAndDelete({uploadedBy:req?.user?._id,_id:req.body._id});
          if(data){
             const collectionInfo = await qdrantClient.collectionExists(COLLECTION_NAME);
             if (collectionInfo.exists) {
               await qdrantClient.delete(COLLECTION_NAME, {
                 wait: true,
                 filter: {
                   must: [
                     {
                       key: "documentId",
                       match: {
                         value: data._id.toString(),
                       },
                     },
                   ],
                 },
               });
             }
             await CHATS.deleteMany({docId:data._id});
             return res.status(200).json({success:true,mssg:"PDF Deleted Successfully"});
          }
        }
        return res.status(400).json({success:false,mssg:"Something Went Wrong"});
    } catch (err) {
        console.log(err);
        return res.status(500).json({success:false,mssg:"Internal Server Down"});
    }
}
export { uploadFile, getUserDocument,getTotalDocuments, deletePdf };
