import path from "path";
import fs from "fs/promises";
import { Document } from "@langchain/core/documents";


const KNOWLEDGE_BASE_PATH = path.join(
    process.cwd(),
    "src",
    "knowledge-base"
);
// console.log(KNOWLEDGE_BASE_PATH);

export const loadDocuments = async () => {
    const files = await fs.readdir(KNOWLEDGE_BASE_PATH);

    const documents = await Promise.all(
        files.map(async (file) => {
            const filePath = path.join(KNOWLEDGE_BASE_PATH, file);
            const content = await fs.readFile(filePath, "utf-8");
            return new Document({
                pageContent: content,
                metadata: { source: file },
            });
        })
    )

    return documents;
}