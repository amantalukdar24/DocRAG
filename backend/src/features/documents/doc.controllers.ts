import { Request, Response } from "express";
import { loadPdfText } from "../../services/pdfparse.js";
import { v2 as cloudinary } from "cloudinary";
import DOC from "./doc.model.js";
import { embeddings } from "../../services/langchain.js";
import qdrantClient, { COLLECTION_NAME, ensureCollection } from "../../qdrantConfig.js";
import CHATS from "../askAI/chats.models.js";
import crypto from "crypto";
import { recursiveSplitText } from "../../utils/textSplitter.js";

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
        
        if (!pdfText || !pdfText.trim()) {
            return res.status(201).json({
                success: true,
                mssg: "PDF Uploaded (No extractable text found)"
            });
        }

        const chunks = recursiveSplitText(pdfText, 1000, 200);

        if (chunks.length > 0) {
            const BATCH_SIZE = 20;
            const vectors: number[][] = [];

            for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
                const batch = chunks.slice(i, i + BATCH_SIZE);
                try {
                    const batchVectors: any = await embeddings.embedDocuments(batch);
                    vectors.push(...batchVectors);
                } catch (batchErr) {
                    console.error(`Embedding batch failed at index ${i}, falling back item by item:`, batchErr);
                    for (const singleChunk of batch) {
                        try {
                            const [singleVec]: any = await embeddings.embedDocuments([singleChunk]);
                            vectors.push(singleVec || []);
                        } catch {
                            vectors.push([]);
                        }
                    }
                }
            }

            const points = [];
            for (let index = 0; index < chunks.length; index++) {
                const vec = vectors[index];
                if (Array.isArray(vec) && vec.length > 0) {
                    points.push({
                        id: crypto.randomUUID(),
                        vector: vec,
                        payload: {
                            documentId: upload._id.toString(),
                            uploadedBy: upload.uploadedBy.toString(),
                            text: chunks[index],
                            chunkIndex: index,
                        },
                    });
                }
            }

            if (points.length > 0) {
                const firstPoint = points[0];
                const vectorSize = firstPoint?.vector ? firstPoint.vector.length : 768;
                await ensureCollection(vectorSize);

                const QDRANT_BATCH_SIZE = 100;
                for (let i = 0; i < points.length; i += QDRANT_BATCH_SIZE) {
                    const pointBatch = points.slice(i, i + QDRANT_BATCH_SIZE);
                    await qdrantClient.upsert(COLLECTION_NAME, {
                        wait: true,
                        points: pointBatch,
                    });
                }
            }
        }

        return res.status(201).json({
            success: true,
            mssg: "PDF Uploaded"
        });
    } catch (err) {
        console.error("Error in uploadFile:", err);
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
