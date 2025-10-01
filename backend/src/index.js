import express from "express";
import dotenv from "dotenv"
import authRoutes from './routes/auth.routes.js';  
import messageRoutes from './routes/message.routes.js';  
import { connectDB } from "./lib/db.js";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { io, app, server } from "./lib/socket.js";

dotenv.config();


app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true,
    }
));
app.use(cookieParser());
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use('/api/auth', authRoutes)
app.use('/api/messages', messageRoutes)

server.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`)
})