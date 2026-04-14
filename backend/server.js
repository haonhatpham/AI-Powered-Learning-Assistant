import dotenv from 'dotenv';
dotenv.config();    

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import errorHandler from './middleware/errorHandler.js';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import flashcardRoutes from './routes/flashcardRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//Tao server express
const app = express();

//Connect to database
connectDB();

//CORS configuration
if(process.env.NODE_ENV !== "production")
{
    app.use(
    cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    })
);
}

//Giúp đọc dữ liệu từ request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));    

//Static folder for uploaded files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//đã chuyển sang cloudinary

//Routes
app.use('/v1/api/auth',authRoutes)
app.use('/v1/api/documents',documentRoutes)
app.use('/v1/api/flashcards',flashcardRoutes)
app.use('/v1/api/ai',aiRoutes)
app.use('/v1/api/quizzes',quizRoutes)
app.use('/v1/api/progress',progressRoutes)

// Serve frontend in production (keep API routes above this)
if (process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "../frontend/ai-learning-assistant/dist");
    app.use(express.static(distPath));

    // SPA fallback: only for non-API routes
    app.get(/.*/, (req, res, next) => {
        if (req.path.startsWith("/v1/api")) return next();
        res.sendFile(path.join(distPath, "index.html"));
    });
}

// 404 handler (API only)
app.use("/v1/api", (req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);

//Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
} );

process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});