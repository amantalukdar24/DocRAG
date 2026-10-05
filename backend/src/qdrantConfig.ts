import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
dotenv.config();

const qdrantClient = new QdrantClient({
  url: (process.env.QDRANT_URL || process.env.Qdrant_URL) as string,
  apiKey: (process.env.QDRANT_API_KEY || process.env.Qdrant_API_KEY) as string,
});

export const COLLECTION_NAME = "docsRag";

export const ensureCollection = async (vectorSize: number = 768) => {
  const result = await qdrantClient.collectionExists(COLLECTION_NAME);
  if (result.exists) {
    try {
      const info = await qdrantClient.getCollection(COLLECTION_NAME);
      const existingVectors = info.config?.params?.vectors;
      const existingSize = typeof existingVectors === "object" && existingVectors !== null && "size" in existingVectors
        ? (existingVectors as { size: number }).size
        : undefined;

      if (existingSize && existingSize !== vectorSize) {
        console.warn(`Vector size mismatch detected: existing ${existingSize}, expected ${vectorSize}. Recreating collection...`);
        await qdrantClient.deleteCollection(COLLECTION_NAME);
        await qdrantClient.createCollection(COLLECTION_NAME, {
          vectors: {
            size: vectorSize,
            distance: "Cosine",
          },
        });
      }
    } catch (err) {
      console.error("Error checking collection vector size:", err);
    }
  } else {
    await qdrantClient.createCollection(COLLECTION_NAME, {
      vectors: {
        size: vectorSize,
        distance: "Cosine",
      },
    });
  }

  try {
    await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
      field_name: "documentId",
      field_schema: "keyword",
      wait: true,
    });
  } catch (err) {
    // Payload index might already exist
  }
};

export default qdrantClient;

