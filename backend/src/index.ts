import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import electricityRoutes from './routes/electricity.routes';
import waterRoutes from './routes/water.routes';
import billRoutes from './routes/bill.routes';
import houseRoutes from './routes/house.routes';
import mohallaRoutes from './routes/mohalla.routes';
import chargesRoutes from './routes/charges.routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString() 
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/electricity', electricityRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/mohallas', mohallaRoutes);
app.use('/api/charges', chargesRoutes);

// Start server
app.listen(port, () => {
  console.log(`⚡️ Server is running on port ${port}`);
});