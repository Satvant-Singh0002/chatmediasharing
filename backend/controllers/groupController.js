const sequelize = require('../utils/db-connection'); // apna path rakho
const Group = require('../models/groupModel');
const GroupMember = require('../models/groupMemberModel');

// POST /group/createGroup
// body: { groupName, createdBy, members: [1, 3, 5] }
exports.createGroup = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { groupName, createdBy, members } = req.body;

        // Validation
        if (!groupName || !groupName.trim()) {
            await t.rollback();
            return res.status(400).json({ message: 'Group name is required' });
        }

        if (!createdBy) {
            await t.rollback();
            return res.status(400).json({ message: 'createdBy is required' });
        }

        if (!Array.isArray(members) || members.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: 'Select at least 1 member' });
        }

        // Duplicate hatao + creator ko hamesha member banao
        const uniqueMembers = [
            ...new Set([...members.map(Number), Number(createdBy)])
        ];

        if (uniqueMembers.length < 2) {
            await t.rollback();
            return res.status(400).json({ message: 'Select at least 1 member' });
        }

        // 1. Group table mein save (id, groupName, createdAt, updatedAt)
        const group = await Group.create(
            { groupName: groupName.trim() },
            { transaction: t }
        );

        // 2. GroupMembers table mein sabhi members save
        const rows = uniqueMembers.map(userId => ({
            groupId: group.id,
            userId,
            isAdmin: userId === Number(createdBy) // creator = admin
        }));

        await GroupMember.bulkCreate(rows, { transaction: t });

        await t.commit();

        return res.status(201).json({
            message: 'Group created successfully',
            group
        });
    } catch (error) {
        await t.rollback();
        console.log('createGroup error:', error);
        return res.status(500).json({ message: 'Failed to create group' });
    }
};

// GET /group/getMyGroups/:userId
exports.getMyGroups = async (req, res) => {
    try {
        const userId = Number(req.params.userId);

        // User kin groups ka member hai
        const memberships = await GroupMember.findAll({
            where: { userId },
            attributes: ['groupId']
        });

        const groupIds = memberships.map(m => m.groupId);

        if (groupIds.length === 0) {
            return res.status(200).json({ groups: [] });
        }

        const groups = await Group.findAll({
            where: { id: groupIds },
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({ groups });
    } catch (error) {
        console.log('getMyGroups error:', error);
        return res.status(500).json({ message: 'Failed to fetch groups' });
    }
};