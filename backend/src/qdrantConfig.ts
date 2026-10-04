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
  if (!result.exists) {
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
