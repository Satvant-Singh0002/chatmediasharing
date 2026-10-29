const {Sequelize}=require('sequelize');

const sequelize=new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host:process.env.DB_HOST,
        dialect:'mysql'
    }
);
(async()=>{
    try {
        await sequelize.authenticate();
        console.log("database connection successfully established");
        
    } catch (error) {
        console.log(error);
        console.log("database connection failed");
        
    }
})();
module.exports=sequelize;