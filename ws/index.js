// Simple WebSocket server for real-time trading data
const WebSocket = require('ws');
const http = require('http');

// Create HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      service: 'nextrade-websocket',
      timestamp: new Date().toISOString() 
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'welcome',
    message: 'Connected to NexTrade WebSocket',
    timestamp: new Date().toISOString()
  }));

  // Handle messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      console.log('Received:', message);
      
      // Echo back for now (will implement real trading data later)
      ws.send(JSON.stringify({
        type: 'echo',
        data: message,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected from WebSocket');
  });
});

const PORT = process.env.WS_PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 NexTrade WebSocket server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});