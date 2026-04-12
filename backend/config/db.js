import mongoose from "mongoose";
import Flashcard from "../models/Flashcard.js";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        try {
            await Flashcard.syncIndexes();
        } catch (idxErr) {
            console.warn("Flashcard.syncIndexes failed:", idxErr.message);
            console.warn(
                "If duplicate key persists, run: db.flashcards.dropIndex('userId_1_documentId_1')",
            );
        }
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;