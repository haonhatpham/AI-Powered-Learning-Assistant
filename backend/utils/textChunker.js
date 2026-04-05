/**
 * Split text into chunks for better AI processing
 * @param {string} text - Full text to be chunked
 * @param {number} chunkSize - Target size per chunk 
 * @param {number} overlap - Number of words to overlap between chunks
 * @return {Array<{content: string, chunkIndex: number, pageNumber: number}>}
 */

import e from "express";

export const chunkText = (text, chunkSize = 500, overlap = 50) => {
    if(!text || text.trim().length === 0){
        return [];
    }
       


    //Clean text while preserving paragraph structure
    const cleanedText = text
        .replace(/\r\n/g, '\n') // Normalize newlines
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .replace(/\n /g, '\n') // Remove spaces at the end of lines
        .replace(/ \n/g, '\n') // Remove spaces at the beginning of lines
        .trim();

    //Try to split by paragraphs (single or double newlines)
    const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0);

    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    let chunkIndex = 0;

    for (const paragraph of paragraphs) {
        const paragraphWords= paragraph.trim().split(/\s+/);
        const paragraphWordCount = paragraphWords.length;

        //If single paragraph exceeds chunk size, split it directly
        if (paragraphWordCount > chunkSize) {
            if(currentChunk.length > 0) {
                chunks.push({
                    content: currentChunk.join('\n\n'),
                    chunkIndex: chunkIndex++,
                    pageNumber: 0, //Page number can be set if available
                });
                currentChunk = [];
                currentWordCount = 0;
            }

        //Split large paragraph into word-based chunks
        for (let i = 0; i < paragraphWords.length; i += chunkSize - overlap) {
            const chunkWords = paragraphWords.slice(i, i + chunkSize);
            chunks.push({
                content: chunkWords.join(' '),
                chunkIndex: chunkIndex++,
                pageNumber: 0, //Page number can be set if available
            });

            if (i + chunkSize >= paragraphWords.length) break; //No more chunks needed  
        }
        continue;
    }

        //If adding this paragraph exceeds chunk size, start a new chunk
        if (currentWordCount + paragraphWordCount > chunkSize) {
            chunks.push({
                content: currentChunk.join('\n\n'),
                chunkIndex: chunkIndex++,
                pageNumber: 0, //Page number can be set if available
            });

            //Create overlap from previous chunk
            const preChunkText = currentChunk.join(' ');
            const preWords = preChunkText.split(/\s+/);
            const overLapText = preWords.slice(-Math.min(overlap, preWords.length)).join(' ');

            currentChunk = [overLapText, paragraph.trim()];
            currentWordCount = overLapText.split(/\s+/).length + paragraphWordCount;
        }else {
            //Add paragraph to current chunk
            currentChunk.push(paragraph.trim());
            currentWordCount += paragraphWordCount;
        }
    }

    //Add the last chunk
    if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.join('\n\n'), 
            chunkIndex: chunkIndex,
            pageNumber: 0, //Page number can be set if available
        });
    }   

    //Fallback: if no chunks created, split by word 
    if (chunks.length === 0 && cleanedText.length > 0) {
        const allWords = cleanedText.split(/\s+/);
        for (let i = 0; i < allWords.length; i += (chunkSize-overlap)) {
            const chunkWords = allWords.slice(i, i + chunkSize);
            chunks.push({
                content: chunkWords.join(' '),
                chunkIndex: chunkIndex++,
                pageNumber: 0,
            });

            if (i + chunkSize >= allWords.length) break; //No more chunks needed    

        }
    }
    return chunks;
};

/**
 * Find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - Array of chunk objects with content and metadata
 * @param {string} query - User query to match against chunks
 * @param {number} maxChunks - Maximum chunks to return 
 * @returns {Array<Object>} 
 */
export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
    if(!chunks || chunks.length === 0 || !query ) {
        return [];
    }

    //Common stop words to exclude
    const stopWords = new Set(
        ['the', 'is', 'in', 'and', 'to', 'of', 'a', 'that', 'it', 'with',
         'as', 'for', 'was', 'on', 'are', 'by', 'this', 'be'
        ]);

        //Extract and clean query keywords
    const queryWords = query
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2 && !stopWords.has(word)); //Filter out short and common words

    if (queryWords.length === 0) {
        //Return clean chunk objects without Mongoose metadata
        return chunks.slice(0, maxChunks).map(chunk  => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id, //Include ID for reference if needed
        }));
    }
    const scoredChunks = chunks.map((chunk,index) => {
        const content = chunk.content.toLowerCase();
        const contentWords = content.split(/\s+/).length;
        let score = 0;

        //Score each query word
        for (const word of queryWords) {
            //Extract word match (higher score)
            const exactMatches = (content.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
            score += exactMatches * 3;

            //Partial matches (lower score)
            const partialMatches = (content.match(new RegExp(word, 'g')) || []).length;
            score += Math.max(0, partialMatches - exactMatches) *1.5;
        }

        //Bonus: Multiple query words found
        const uniqueWordsFound= queryWords.filter(word => 
            content.includes(word)
        ).length;
        if (uniqueWordsFound > 1) {
            score += uniqueWordsFound *2; 
        }

        //Normalize by content length to avoid bias towards longer chunks
        const normalizedScore = score/Math.sqrt(contentWords);

        //Small bonus for earlier chunks (assuming they may be more relevant)
        const positionBonus = (1 - index / chunks.length)*0.1;

        //Return clean object without Mongoose metadata
        return{
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id, //Include ID for reference if needed
            score: normalizedScore * positionBonus,
            rawScore: score,
            matchWords: uniqueWordsFound
        };
    });

    return scoredChunks
        .filter(chunk => chunk.score > 0) //Only include chunks with some relevance
        .sort((a,b) => {
            if (b.score !== a.score) {
            return b.score - a.score; //Primary sort by relevance score
        }
        if (b.matchWords !== a.matchWords) {
            return b.matchWords - a.matchWords; //Secondary sort by number of query words matched
        }
        return a.chunkIndex - b.chunkIndex; //Tertiary sort by original order
    })
        .slice(0, maxChunks) //Limit to top N chunks
};
