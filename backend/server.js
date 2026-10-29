const express = require('express');
const http=require('http');

const dotenv=require('dotenv');
const path = require('path');

dotenv.config({
    path:path.join(__dirname,'.env')
});

const app=express();
const server=http.createServer(app);


// middleware and routes
const cors=require('cors');

const db=require('./utils/db-connection');
const userRoute=require('./Routes/userRoute');
const socketIo=require('./socket_io');
const getAllMessagesRoute=require('./Routes/getAllMessageRoute');
const groupRoutes = require('./Routes/groupRoutes');
const mediaRoute = require('./Routes/mediaRoute');

require('./models');
require('./models/userModel');
require('./models/messageModel');
app.use(cors());
app.use(express.json());
app.use('/user',userRoute);
app.use('/messages',getAllMessagesRoute);
app.use('/group', groupRoutes);
app.use('/media', mediaRoute);
// Initialize Socket.IO after creating server
const io=socketIo(server);

const port=3000;

db.sync({alter:true}).then(()=>{
    server.listen(port,()=>{
    console.log(`server is running on ${port}`);
})

})