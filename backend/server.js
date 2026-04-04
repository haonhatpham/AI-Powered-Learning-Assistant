import dotenv from 'dotenv';
dotenv.config();    

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
conts __dirname = path.dirname(__filename);

const app = express();


connectDB();


app.use(
    cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));    

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


//Routes


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