import dotenv from 'dotenv';
dotenv.config();    

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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
app.use(
    cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    })
);

//Giúp đọc dữ liệu từ request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));    

//Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//Routes
app.use('/v1/api/auth',authRoutes)
app.use('/v1/api/documents',documentRoutes)
app.use('/v1/api/flashcards',flashcardRoutes)
app.use('/v1/api/ai',aiRoutes)
app.use('/v1/api/quizzes',quizRoutes)
app.use('/v1/api/progress',progressRoutes)


app.use(errorHandler);

//404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
}

);

//Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
} );

process.on('unhandledRejection', (err) => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
});