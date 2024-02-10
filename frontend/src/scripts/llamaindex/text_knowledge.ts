//Query documents of text with an LLM
import fs from "fs/promises";
import { Document, VectorStoreIndex } from 'llamaindex';
import dotenv from 'dotenv';
import pdfParse from 'pdf-parse';

dotenv.config();

async function main() {
    const pdfBuffer = await fs.readFile("whitepaper-v1.pdf");
    const pdfData = await pdfParse(pdfBuffer);
    const essay = pdfData.text;

    console.log(essay)

    const document = new Document({ text: essay });
    const index = await VectorStoreIndex.fromDocuments([document]);
    console.log(index)
    const queryEngine = index.asQueryEngine();

    const response = await queryEngine.query({
        query: "What is Jarvis?"
    });

    console.log(response.toString());
}

main().catch(console.error);
