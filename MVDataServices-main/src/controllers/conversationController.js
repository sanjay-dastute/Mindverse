const conversationConnection = require('../config/conversation');
const Conversation = conversationConnection.model('Conversation');
const logger = require('../config/logger');
const getConversation = async (req, res) => {
    try {
        const { organizationId, fromId } = req.params;

        logger.info(`Fetching conversation for organizationId: ${organizationId}, fromId: ${fromId}`);

        const conversation = await Conversation.findOne({ organizationId, fromId });

        if (!conversation) {
            logger.info(`Conversation not found for organizationId: ${organizationId}, fromId: ${fromId}`);
            return res.status(404).json({ message: "Conversation not found" });
        }

        logger.info(`Successfully fetched conversation`);
        res.status(200).json(conversation);
    } catch (error) {
        logger.error({ err: error }, `Error fetching conversation`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateConversation = async (req, res) => {
    try {
        const { organizationId, fromId } = req.params;
        const updateData = req.body;

        logger.info(`Updating conversation for organizationId: ${organizationId}, fromId: ${fromId}`);

        const updatedConversation = await Conversation.findOneAndUpdate(
            { organizationId, fromId },
            updateData,
            { new: true }
        );

        if (!updatedConversation) {
            logger.info(`Conversation not found for update: organizationId: ${organizationId}, fromId: ${fromId}`);
            return res.status(404).json({ message: "Conversation not found" });
        }

        logger.info(`Successfully updated conversation`);
        res.status(200).json(updatedConversation);
    } catch (error) {
        logger.error({ err: error }, `Error updating conversation`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const markMessageAsDeleted = async (req, res) => {
    try {
        const { organizationId, fromId, messageId } = req.params;

        logger.info(`Marking message as deleted for organizationId: ${organizationId}, fromId: ${fromId}, messageId: ${messageId}`);

        const updatedConversation = await Conversation.findOneAndUpdate(
            { organizationId, fromId },
            { $set: { "messages.$[elem].isDeleted": true } },
            {
                arrayFilters: [{ "elem.messageId": messageId }],
                new: true
            }
        );

        if (!updatedConversation) {
            logger.warn(`Conversation not found for organizationId: ${organizationId}, fromId: ${fromId}`);
            return res.status(404).json({ message: "Conversation not found" });
        }

        logger.info(`Message marked as deleted successfully`);
        res.status(200).json({ message: "Message marked as deleted" });
    } catch (error) {
        logger.error({ err: error }, `Error marking message as deleted`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createConversation = async (req, res) => {
    try {
        const conversationData = req.body;

        logger.info(`Creating new conversation for organizationId: ${conversationData.organizationId}`);

        const newConversation = new Conversation(conversationData);
        await newConversation.save();

        logger.info(`Successfully created new conversation`);
        res.status(201).json(newConversation);
    } catch (error) {
        logger.error({ err: error }, `Error creating conversation`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getConversations = async (req, res) => {
    const { organizationId } = req.query;

    try {
        logger.info(`Fetching conversations for organizationId: ${organizationId}`);

        const conversations = await Conversation.find({ organizationId }).lean();

        if (conversations && conversations.length > 0) {
            logger.info(`Successfully fetched ${conversations.length} conversations for organizationId: ${organizationId}`);
            res.json(conversations);
        } else {
            logger.info(`No conversations found for organizationId: ${organizationId}`);
            res.status(404).json({ message: "No data found for this organization ID" });
        }
    } catch (err) {
        logger.error({ err }, `Error fetching conversations for organizationId: ${organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getConversationsByMediaId = async (req, res) => {
    try {
        const { organizationId, mediaId } = req.params;

        if (!organizationId || !mediaId) {
            logger.info('Request made without organizationId or mediaId');
            return res.status(400).json({ message: "Bad request: organizationId and mediaId are required" });
        }

        logger.info(`Fetching conversations for organizationId: ${organizationId}, mediaId: ${mediaId}`);

        const conversations = await Conversation.find({
            organizationId,
            'messages.mediaId': mediaId
        }).lean();

        if (conversations.length === 0) {
            logger.info(`No conversations found for organizationId: ${organizationId}, mediaId: ${mediaId}`);
            return res.status(404).json({ message: "No conversations found" });
        }

        logger.info(`Successfully fetched conversations with matching mediaId`);
        res.status(200).json(conversations);
    } catch (error) {
        logger.error({ err: error }, `Error fetching conversations by mediaId`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getMessageCountForOrganizationByDateRange = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { startDate, endDate } = req.query;

        if (!organizationId || !startDate) {
            logger.info('Request made without organizationId or startDate');
            return res.status(400).json({ message: "Bad request: organizationId and startDate are required" });
        }

        const startDateTime = new Date(startDate);
        let endDateTime;

        if (endDate) {
            endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999); // Set to end of day
            logger.info(`Fetching message count for organizationId: ${organizationId}, from ${startDate} to ${endDate}`);
        } else {
            endDateTime = new Date(startDateTime);
            endDateTime.setHours(23, 59, 59, 999); // Set to end of start date
            logger.info(`Fetching message count for organizationId: ${organizationId}, for date ${startDate}`);
        }

        startDateTime.setHours(0, 0, 0, 0); // Set to start of day

        const messageCount = await Conversation.aggregate([
            { $match: { organizationId: organizationId } },
            { $unwind: "$messages" },
            {
                $match: {
                    "messages.createdTimestamp": {
                        $gte: startDateTime,
                        $lte: endDateTime
                    }
                }
            },
            { $count: "total" }
        ]);

        const count = messageCount.length > 0 ? messageCount[0].total : 0;

        logger.info(`Successfully fetched message count: ${count}`);
        res.status(200).json({ count: count });
    } catch (error) {
        logger.error({ err: error }, `Error fetching message count`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getUserCountByDateRangeForOrganization = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { startDate, endDate } = req.query;

        if (!organizationId || !startDate) {
            logger.info('Request made without organizationId or startDate');
            return res.status(400).json({ message: "Bad request: organizationId and startDate are required" });
        }

        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0); // Set to start of day

        let endDateTime;
        if (endDate) {
            endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999); // Set to end of day
            logger.info(`Fetching user count for organizationId: ${organizationId}, from ${startDate} to ${endDate}`);
        } else {
            endDateTime = new Date(startDateTime);
            endDateTime.setHours(23, 59, 59, 999); // Set to end of start date
            logger.info(`Fetching user count for organizationId: ${organizationId}, for date ${startDate}`);
        }

        const result = await Conversation.aggregate([
            {
                $match: {
                    organizationId: organizationId,
                    "messages.createdTimestamp": { $gte: startDateTime, $lte: endDateTime }
                }
            },
            { $unwind: "$messages" },
            {
                $match: {
                    "messages.createdTimestamp": { $gte: startDateTime, $lte: endDateTime }
                }
            },
            {
                $group: {
                    _id: null,
                    uniqueUsers: { $addToSet: "$userId" }
                }
            },
            {
                $project: {
                    _id: 0,
                    userCount: { $size: "$uniqueUsers" },
                    userIds: "$uniqueUsers"
                }
            }
        ]);

        const { userCount, userIds } = result.length > 0 ? result[0] : { userCount: 0, userIds: [] };

        logger.info(`Successfully fetched user count and IDs for organizationId: ${organizationId}`);
        res.status(200).json({ userCount, userIds });
    } catch (error) {
        logger.error({ err: error }, `Error fetching user count and IDs for organizationId: ${req.params.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteAllMessagesForUser = async (req, res) => {
    try {
        const { organizationId, fromId } = req.params;

        logger.info(`Deleting all messages for organizationId: ${organizationId}, fromId: ${fromId}`);

        const result = await Conversation.findOneAndUpdate(
            { organizationId, fromId },
            { $set: { messages: [] } },
            { new: true }
        );

        if (!result) {
            logger.warn(`Conversation not found for organizationId: ${organizationId}, fromId: ${fromId}`);
            return res.status(404).json({ message: "Conversation not found" });
        }

        logger.info(`Successfully deleted all messages for user`);
        res.status(200).json({ message: "All messages deleted successfully" });
    } catch (error) {
        logger.error({ err: error }, `Error deleting all messages for user`);
        res.status(500).json({ message: "Internal server error" });
    }
};

// const getFeelings = async (req, res) => {
//     try {
//         const { organizationId } = req.params;

//         logger.info(`Fetching user feeling for organizationId: ${organizationId}`);

//         // const conversation = await Conversation.findOne({ organizationId, fromId });

//         // if (!conversation) {
//         //     logger.info(`Conversation not found for organizationId: ${organizationId}, fromId: ${fromId}`);
//         //     return res.status(404).json({ message: "Conversation not found" });
//         // }

//         // logger.info(`Successfully fetched conversation`);
//         // res.status(200).json(conversation);
//     } catch (error) {
//         logger.error({ err: error }, `Error fetching user feeling`);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

const postUserFeeling = async (req, res) => {
    try {
        const { organizationId } = req.query;
        const { options, user, feeling } = req.body;

        logger.info(`Updating user feeling for organizationId: ${organizationId} with message ids`);

        const conversation = await Conversation.findOne({ organizationId, userId: user });

        if (!conversation) {
            logger.info(`Conversation not found for organizationId: ${organizationId}, fromId: ${fromId}`);
            return res.status(404).json({ message: "Conversation not found" });
        }
        conversation.messages = conversation.messages.map(message => {
            if (options.includes(message._id.toString())) {
                return { ...message, userFeeling: feeling };
            }
            return message;
        });
        await conversation.save();

        logger.info(`Successfully updated user feelings for the specified messages`);
        res.status(200).json({ message: "User feelings updated successfully" });
    } catch (error) {
        logger.error({ err: error }, `Error updating user feeling`);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getConversation,
    updateConversation,
    createConversation,
    markMessageAsDeleted,
    getConversations,
    getConversationsByMediaId,
    getMessageCountForOrganizationByDateRange,
    getUserCountByDateRangeForOrganization,
    deleteAllMessagesForUser,
    // getFeelings,
    postUserFeeling
}