const express= require('express');
const router=express.Router();

const usercontroller=require('../controllers/userController');
router.post('/addUser',usercontroller.addUser);
router.post('/login',usercontroller.login);
router.get('/getAllUsers',usercontroller.getAllUsers);
module.exports=router;