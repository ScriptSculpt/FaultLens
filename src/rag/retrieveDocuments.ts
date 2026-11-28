import { pool } from "../config/database.js";
import { embedQuery } from "./embedDocuments.js";

export const retrieveDocuments = async (query: string) => {
    const vector = await embedQuery(query);

    const result = await pool.query(
        `SELECT
            id,
            content,
            metadata,
            embedding <=> $1 AS distance
        FROM knowledge_chunks
        ORDER BY embedding <=> $1
        LIMIT 5`,
        [JSON.stringify(vector)]
    );

    return result.rows;
}