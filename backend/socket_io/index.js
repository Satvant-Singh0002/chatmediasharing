
const {Server}=require('socket.io');
const chatHandler=require('./handlers/chat');
module.exports=(server)=>{
    const io= new Server(server,{
     cors: {
        origin: [
                'http://localhost:5500',
                'http://127.0.0.1:5500'
            ],
        methods: ['GET', 'POST']
    }
});

 io.on('connection',(socket)=>{
    chatHandler(socket,io);

})
return io;

}
