const {DataTypes}=require('sequelize');
const db=require('../utils/db-connection');

const groupMembers=db.define('groupMembers',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true

    },
    groupId:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    userId:{
        type:DataTypes.INTEGER,
        allowNull:false

    },
    isAdmin:{
        type:DataTypes.BOOLEAN,
        defaultValue:false
    }
});
module.exports=groupMembers;