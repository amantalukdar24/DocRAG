import { PDFParse } from "pdf-parse";
import fs from "fs";
/**
 * Fetch PDF file content safely from remote URL or local file path
 * and return extracted plain text.
 */
async function loadPdfText(pdfPath: string): Promise<string> {
    let uint8Data: Uint8Array;

    if (pdfPath.startsWith("http://") || pdfPath.startsWith("https://")) {
        // Enforce HTTPS to prevent fetch failures on HTTP redirects
        const secureUrl = pdfPath.startsWith("http://")
            ? pdfPath.replace("http://", "https://")
            : pdfPath;
            
        const response = await fetch(secureUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch PDF document from URL: Status ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        uint8Data = new Uint8Array(arrayBuffer);
    } else {
        const fileBuffer = fs.readFileSync(pdfPath);
        uint8Data = new Uint8Array(fileBuffer);
    }

    const pdfInstance = new PDFParse({ data: uint8Data });
    const parsed = await pdfInstance.getText();
    return parsed?.text || "";
}

export { loadPdfText };