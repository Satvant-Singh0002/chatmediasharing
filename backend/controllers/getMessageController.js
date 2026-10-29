const Message=require('../models/messageModel');


const getMessages=async(req,res)=>{
    try {
        const roomId=req.params.roomId;
        const messages=await Message.findAll({
            where:{roomId},
            order:[['createdAt','ASC']]
        });
        res.status(200).json({
            messages:messages
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:'server failed to fetch all messages'
        })
        
    }
}
module.exports={
    getMessages
}