import fd from 'fs/promises';
import { PDFParse } from 'pdf-parse';

/**
 * Extract text content from a PDF file
 * @param {string} filePath - Path to the PDF file
 * @return {Promise<{text: string , numPages: number}>} - Extracted text content
 */
export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fd.readFile(filePath); 
        //pdf-parse expects a UnitBArray, not a Buffer
        const parser = new PDFParse(new Uint8Array(dataBuffer));
        const data = await parser.getText();

        return { 
            text: data.text, 
            numPages: data.numpages,
            info: data.info,};
    } catch (error) {
        console.error('PDF parsing error:', error); 
        throw new Error('Failed to extract text from PDF');
    } 
};