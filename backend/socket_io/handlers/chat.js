
// const Messaage = require('../../models/messageModel');
// module.exports=(socket,io)=>{
//    socket.on('join_room',(roomId)=>{
//       socket.join(roomId);
//       console.log(`User ${socket.id} joined room ${roomId}`);
//    });
//    socket.on('personal_message',async(data)=>{
//       try {
//          const savedMessage=await Messaage.create({
//             senderId:data.senderId,
//             roomId:data.roomId,
//             message:data.message
//          })
         
//            io.to(data.roomId).emit('received_message',data);
//       } catch (error) {
//          console.log('message saved failed',error);
         
//       }
//    });
   
// }

const Message = require('../../models/messageModel');
const GroupMember = require('../../models/groupMemberModel'); // apna model ka naam/path check karo

module.exports = (socket, io) => {

    socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('personal_message', async (data) => {
        try {
            const { senderId, roomId, message } = data;

            if (!senderId || !roomId || !message || !message.trim()) {
                return;
            }

            // Group message: pehle check karo sender us group ka member hai ya nahi
            if (String(roomId).startsWith('group_')) {
                const groupId = Number(String(roomId).split('_')[1]);

                const isMember = await GroupMember.findOne({
                    where: { groupId, userId: Number(senderId) }
                });

                if (!isMember) {
                    console.log(`User ${senderId} is not a member of ${roomId}`);
                    return;
                }
            }

            const savedMessage = await Message.create({
                senderId,
                roomId,
                message
            });

            io.to(roomId).emit('received_message', data);
        } catch (error) {
            console.log('message saved failed', error);
        }
    });
    //personal media sharing

    socket.on('personal_media_message',async(data)=>{
        try {
            const {senderId,roomId,mediaUrl,mediaType}=data;
        if(!senderId || !roomId || !mediaUrl || !mediaType){
            return;
        }
        const savedMessage= await Message.create({
            senderId,
            roomId,
            mediaUrl,
            mediaType
        });
        io.to(roomId).emit('received_media',data);
            
        } catch (error) {
            console.log('Media_message saved failed', error);
            
        }
        
    })

};