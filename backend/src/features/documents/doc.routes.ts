import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { uploadFile, getUserDocument,getTotalDocuments, deletePdf } from "./doc.controllers.js";
import { authUser } from "../../middleware/authUser.js";
import dotenv from "dotenv";
dotenv.config();

const router = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = file.originalname.split(".").pop();
    const cleanName = file.originalname
      .replace(/\.[^/.]+$/, "")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_");

    const fileName = `${cleanName}-${Date.now()}.${ext}`;

    return {
      folder: "DocRag/PDFs",
      resource_type: "raw",
      public_id: fileName,
      access_mode: "public",
      use_filename: true,
      unique_filename: true
    };
  },
});

const upload = multer({ storage });

router.post("/upload", authUser, upload.single("pdf"), uploadFile);
router.get("/getdocuments", authUser, getUserDocument);
router.get("/gettotaldocs",authUser,getTotalDocuments);
router.delete("/deletepdf",authUser,deletePdf);
export default router;