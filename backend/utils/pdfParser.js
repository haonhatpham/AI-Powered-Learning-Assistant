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
        return await extractTextFromPDFBuffer(dataBuffer);
    } catch (error) {
        console.error('PDF parsing error:', error); 
        throw new Error('Failed to extract text from PDF');
    } 
};

export const extractTextFromPDFBuffer = async (buffer) => {
    try {
        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();
        await parser.destroy();
        return {
            text: data.text,
            numPages: data.total,
            info: undefined,
        };
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error('Failed to extract text from PDF');
    }
};