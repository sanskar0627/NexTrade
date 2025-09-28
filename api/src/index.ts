import express from "express";
import cors from "cors";
import orderRouter from "./routes/order";
import { depthRouter } from "./routes/depth";
import { tradesRouter } from "./routes/trades";
import { klineRouter } from "./routes/kline";
import { tickersRouter } from "./routes/ticker";
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import { startDemoGenerator } from "./demoTradeGenerator";

const app = express();

// Enhanced CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.com'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.use("/api/v1/order", orderRouter);
app.use("/api/v1/depth", depthRouter);
app.use("/api/v1/trades", tradesRouter);
app.use("/api/v1/klines", klineRouter);
app.use("/api/v1/tickers", tickersRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
    console.error('Global error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Handle 404 routes
app.use('*', (req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

const PORT = parseInt(process.env.PORT || '3001');

app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 NexTrade API Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 API endpoints: http://localhost:${PORT}/api/v1/`);
    
    // Start demo trade generator for live trades
    setTimeout(async () => {
        try {
            await startDemoGenerator();
            console.log("✅ Demo trade generator started successfully");
        } catch (error) {
            console.error("❌ Failed to start demo trade generator:", error);
        }
    }, 2000); // Wait 2 seconds for server to fully start
});