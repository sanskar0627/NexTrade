import { Router } from "express";

export const klineRouter = Router();

klineRouter.get("/", async (req, res) => {
    const { market, interval, startTime, endTime } = req.query;

    let query;
    switch (interval) {
        case '1m':
            query = `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
            break;
        case '1h':
            query = `SELECT * FROM klines_1m WHERE  bucket >= $1 AND bucket <= $2`;
            break;
        case '1w':
            query = `SELECT * FROM klines_1w WHERE bucket >= $1 AND bucket <= $2`;
            break;
        default:
            return res.status(400).send('Invalid interval');
    }

    try {
        // Return demo kline data for charting
        const baseTime = Date.now();
        const klineData = [];
        
        for (let i = 0; i < 100; i++) {
            const time = baseTime - (i * 60000); // 1 minute intervals
            const basePrice = 50000 + Math.sin(i * 0.1) * 2000;
            klineData.push({
                time: time,
                open: Math.round(basePrice + Math.random() * 100),
                high: Math.round(basePrice + Math.random() * 200),
                low: Math.round(basePrice - Math.random() * 200),
                close: Math.round(basePrice + Math.random() * 100),
                volume: Math.round(Math.random() * 1000)
            });
        }
        
        res.json(klineData.reverse());
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Failed to fetch kline data' });
    }
});