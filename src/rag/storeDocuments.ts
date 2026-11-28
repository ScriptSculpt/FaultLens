import { Document } from "@langchain/core/documents";
import { pool } from "../config/database.js";

export const storeDocuments = async (chunks: Document[], vectors: number[][]) => {
    if(chunks.length !== vectors.length) {
        throw new Error("Chunks and vectors length mismatch");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        await client.query("TRUNCATE TABLE knowledge_chunks RESTART IDENTITY");

        // console.log("Number of vectors:", vectors.length);
        // console.log("First vector dimensions:", vectors[0]?.length);
        // console.log("First vector:", vectors[0]?.slice(0, 5));
                

        for(let i = 0; i < chunks.length; i++) {

            console.log(typeof JSON.stringify(vectors[i]));
            console.log(JSON.stringify(vectors[i]).slice(0, 100)); 
            await client.query(
                "INSERT INTO knowledge_chunks (content, metadata, embedding) VALUES ($1, $2, $3)",
                [chunks[i].pageContent, JSON.stringify(chunks[i].metadata), JSON.stringify(vectors[i])]
            );
        }

        await client.query("COMMIT");
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};