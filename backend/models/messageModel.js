const {Sequelize,DataTypes}=require('sequelize');
const db=require('../utils/db-connection');

const Message=db.define('message',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    senderId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    roomId:{
        type:DataTypes.STRING,
        allowNull:true
    },
    message:{
        type:DataTypes.STRING,
        allowNull:true
    },
    mediaUrl:{
        type:DataTypes.TEXT,
        allowNull:true
    },
    mediaType:{
        type:DataTypes.STRING,
        allowNull:true
    }

});
module.exports=Message;