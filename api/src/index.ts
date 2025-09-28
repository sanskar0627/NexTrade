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
app.use(cors());
app.use(express.json());

app.use("/api/v1/order", orderRouter);
app.use("/api/v1/depth", depthRouter);
app.use("/api/v1/trades", tradesRouter);
app.use("/api/v1/klines", klineRouter);
app.use("/api/v1/tickers", tickersRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

app.listen(3000, async () => {
    console.log("Server is running on port 3000");
    
    // Start demo trade generator for live trades
    setTimeout(async () => {
        await startDemoGenerator();
        console.log("Demo trade generator started");
    }, 2000); // Wait 2 seconds for server to fully start
});