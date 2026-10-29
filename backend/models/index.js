const Group=require('./groupModel');
const GroupMember=require('./groupMemberModel');

Group.hasMany(GroupMember,{
    foreignKey:'groupId'
});
GroupMember.belongsTo(Group,{
    foreignKey:'groupId'
});
module.exports={
    Group,
    GroupMember
}