const User=require('../models/userModel');
const bcrypt=require('bcrypt');
const {Op}=require('sequelize');
const addUser=async(req,res)=>{
    try {
        const {name,email,phone,password}=req.body;
        
        const existingUser=await User.findOne({
            where:{email}
        });
        if(existingUser){
            return res.status(409).json({
                message:"user already exist"
            });
        }
         const hashedPassword=await bcrypt.hash(password,10);
        const user=await User.create({
            name:name,
            email:email,
            phone:phone,
            password:hashedPassword
        });
        res.status(201).json({
            message:"signup successfully"
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"error while signup"
        });
        
    }
}
const login=async(req,res)=>{
    try {
        const {emailorphone,password }=req.body;
         console.log("req.body",req.body);
        if(!emailorphone || !password){
            return res.status(400).json({
                message:"Email/phone and password are required"
            });
        }
        const user=await User.findOne({
            where:{
                [Op.or]:[
                    {email:emailorphone},
                    {phone: emailorphone}
                ]
            }
        });
        if(!user){
            return res.status(404).json({
                message:'User not found'
            });
        }
        const isPasswordValid=await bcrypt.compare(
            password,
            user.password
        );
        console.log('password valid',isPasswordValid);
        if(!isPasswordValid){
            return res.status(401).json({
                message:'password invalid'
            })
        }
        return res.status(200).json({
            id:user.id,
            email:user.email,
            message:'user login successfully'
        });

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:'Internal server error'
        });
    }
}
const getAllUsers=async(req,res)=>{
    try {
        const users=await User.findAll({
            attributes:['id','name','email']
        });
        return res.status(200).json(users);
        
    } catch (error) {
        
        console.log(error);
        return res.status(500).json({
            message:'error while fetching users'
        })
    }
}
module.exports={
    addUser,
    login,
    getAllUsers
}
