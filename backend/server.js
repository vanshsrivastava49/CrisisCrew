const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const userRoutes = require('./routes/userRoutes');
const donationRoutes = require('./routes/donationRoutes');
const WebSocket = require('ws'); 
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
}));
const db = require('./config/db');

app.use('/api', userRoutes);
app.use('/api',donationRoutes);
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.on('message', (message) => {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
