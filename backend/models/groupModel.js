const {DataTypes}=require('sequelize');
const db=require('../utils/db-connection');

const Group=db.define('group',{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true

    },
    groupName:{
        type:DataTypes.STRING,
        allowNull:false
    }

});
module.exports=Group;