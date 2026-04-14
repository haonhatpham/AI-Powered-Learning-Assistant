import axiosInstance  from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const generateFlashcards = async (documentId, options) =>{
    try{
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_FLASHCARDS,{ documentId, ...options });
        const payload = response.data;
        if (!payload?.success) throw payload || { message: "Failed to generate flashcards" };
        const cardsCount = payload?.data?.cards?.length ?? 0;
        if (cardsCount <= 0) throw { message: "No flashcards were generated" };
        return payload;
    } catch (error) {
        throw error.response?.data || error || {message: "Failed to generate flashcards" };
    }
};

const generateQuiz = async (documentId, options) =>{
    try{
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_QUIZ,{ documentId, ...options });
        const payload = response.data;
        if (!payload?.success) throw payload || { message: "Failed to generate quiz" };
        const qCount = payload?.data?.questions?.length ?? 0;
        if (qCount <= 0) throw { message: "No quiz questions were generated" };
        return payload;
    } catch (error) {
        throw error.response?.data || error || {message: "Failed to generate quiz" };
    }
};

const generateSummary = async (documentId) =>{
    try{
        const response = await axiosInstance.post(API_PATHS.AI.GENERATE_SUMMARY,{ documentId });
        const payload = response.data;
        if (!payload?.success) throw payload || { message: "Failed to generate summary" };
        const data = payload?.data;
        if (!data?.summary) throw { message: "Failed to generate summary" };
        return data;
    } catch (error) {
        throw error.response?.data || error || {message: "Failed to generate summary" };
    }
};

const chat = async (documentId, message) =>{
    try{
        const response = await axiosInstance.post(API_PATHS.AI.CHAT,{ documentId, question: message }); // Removed history from payload
        return response.data;
    } catch (error) {
        throw error.response?.data || {message: "Chat request failed" };
    }
};

const explainConcept = async (documentId, concept) =>{
    try{
        const response = await axiosInstance.post(API_PATHS.AI.EXPLAIN_CONCEPT,{ documentId, concept });
        const payload = response.data;
        if (!payload?.success) throw payload || { message: "Failed to explain concept" };
        const data = payload?.data;
        if (!data?.explanation) throw { message: "Failed to explain concept" };
        return data;
    } catch (error) {
        throw error.response?.data || error || {message: "Failed to explain concept" };
    }
};

const getChatHistory = async (documentId) =>{
    try{
        const response = await axiosInstance.get(
            API_PATHS.AI.GET_CHAT_HISTORY(documentId)
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || {message: "Failed to fetch chat history" };
    }
};

 const aiService = {
    generateFlashcards,
    generateQuiz,
    generateSummary,
    chat,
    explainConcept,
    getChatHistory
 }

 export default aiService;