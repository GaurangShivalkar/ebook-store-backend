// src/index.ts
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import purchaseRoutes from './routes/purchase.routes';
import dashboardRoutes from './routes/dashboard.routes';
import cors from 'cors';


dotenv.config();

connectDB();
const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000' // Only allow your frontend to make requests
}));

// Middleware to parse JSON bodies
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('FileSure Referral System API is running!');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});