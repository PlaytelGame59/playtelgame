const express = require('express')
const app = express();
const cors = require('cors')
const db = require("./config/db");

const adminRoutes  = require('./routes/AdminRoutes')
const playerRoutes  = require('./routes/PlayerRoutes')    

require("dotenv").config()

const { createServer } = require("http");
const { Server } = require("socket.io");
const {initializeSocketIO } = require("./socket/service");
const bodyParser = require('body-parser');
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

const PORT = process.env.PORT || 2001       

app.use(express.urlencoded({limit: '25mb', extended: true}));
app.use(express.json())  
app.use(cors()) 
// Increase the payload limit (e.g., 10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

db();

// define api Routes
app.use('/admin', adminRoutes);
app.use('/api', playerRoutes);

io.use((socket, next) => {
  if (socket.handshake.query.token === 'UNITY') {
    next();
  } else {
    next(new Error('Authentication error'));
  }
}); 

initializeSocketIO(io)

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;