const express=require('express');
const router=express.Router();

const messageController=require('../controllers/getMessageController');

router.get('/getMessages/:roomId',messageController.getMessages);
module.exports=router;