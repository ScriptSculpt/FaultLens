import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

export const splitDocuments = async (documents: Document[]) => {
    const chunks = await splitter.splitDocuments(documents);

    // console.log(`Split ${documents.length} documents into ${chunks.length} chunks.`);

    return chunks;
}