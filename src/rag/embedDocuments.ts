import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not defined in the environment variables.");
}

const embeddingModel = new GoogleGenerativeAIEmbeddings({
    model: "gemini-embedding-001",
    apiKey: GOOGLE_API_KEY
});

export const embedDocuments = async (chunks: Document[]) => {
    const vectors = await embeddingModel.embedDocuments(
        chunks.map(chunk => chunk.pageContent)
    )
    // console.log(`Generated ${vectors.length} embeddings`);
    // console.log(`Embedding dimensions: ${vectors[0]?.length}`);

    return vectors;
}

export const embedQuery = async (query: string) => {
    const vector = await embeddingModel.embedQuery(query);

    return vector;
}