const userConnection = require('../config/user');
const UniversalContext = userConnection.model('UniversalContext');
const User = userConnection.model('User');
const OtherUser = userConnection.model('OtherUser');
const supportConnection = require('../config/support');
const SupportRequest = supportConnection.model('SupportRequest');
const conversationConnection = require('../config/conversation');
const Conversation = conversationConnection.model('Conversation');
const logger = require('../config/logger');
const mongoose = require('mongoose');

const getAllUsers = async (req, res) => {
    try {
        logger.info('Fetching all users (excluding posts)');
        const users = await User.find({}, { posts: 0 });

        if (!users || users.length === 0) {
            logger.error('No users found in the database');
            return res.status(404).json({ message: "No users found" });
        }

        logger.info(`Successfully fetched ${users.length} users`);
        res.status(200).json(users);
    } catch (error) {
        logger.error({ error }, 'Error fetching users');
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAllUniversalContexts = async (req, res) => {
    try {
        logger.info('Fetching all universal contexts');
        let contexts = await UniversalContext.find({}).sort('createdAt');

        // If there are fewer than 3 contexts, add the missing ones
        if (contexts.length < 3) {
            logger.info('Less than 3 contexts found. Adding default contexts.');
            const defaultContexts = [
                { isActive: contexts.length === 0, prompt: "Default value 1" },
                { isActive: false, prompt: "Default value 2" },
                { isActive: false, prompt: "Default value 3" },
            ];

            for (let i = contexts.length; i < 3; i++) {
                const newContext = new UniversalContext(defaultContexts[i]);
                await newContext.save();
                contexts.push(newContext);
            }
        }

        // If there are more than 3 contexts, remove the excess
        if (contexts.length > 3) {
            logger.info('More than 3 contexts found. Removing excess contexts.');
            const activeContext = contexts.find(context => context.isActive);
            const inactiveContexts = contexts.filter(context => !context.isActive);

            // Keep the active context and the two oldest inactive contexts
            contexts = [activeContext, ...inactiveContexts.slice(0, 2)];

            // Delete any contexts not in the new contexts array
            await UniversalContext.deleteMany({
                _id: { $nin: contexts.map(c => c._id) }
            });
        }

        // Ensure one context is active
        const activeContext = contexts.find(context => context.isActive);
        if (!activeContext) {
            logger.info('No active context found. Setting the first context as active.');
            contexts[0].isActive = true;
            await contexts[0].save();
        }

        const transformedContexts = contexts.map(transformContext);

        logger.info('Successfully fetched and processed universal contexts');
        res.status(200).json(transformedContexts);
    } catch (error) {
        logger.error({ error }, 'Error in getAllUniversalContexts:');
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateUniversalContext = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the id is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            logger.error(`Invalid context ID provided: ${id}`);
            return res.status(400).json({ message: "Failed to update context settings: Invalid context ID" });
        }

        const { isActive, prompt } = req.body;

        logger.info(`Updating universal context with ID: ${id}`);

        const existingContext = await UniversalContext.findById(id);

        if (!existingContext) {
            logger.error(`Context not found for ID: ${id}`);
            return res.status(404).json({ message: "Failed to update context settings: Context not found" });
        }

        existingContext.isActive = isActive;
        existingContext.prompt = prompt;
        await existingContext.save();

        // If this context is set to active, deactivate others
        if (isActive) {
            logger.info(`Setting context ${id} as active and deactivating others`);
            await UniversalContext.updateMany(
                { _id: { $ne: id } },
                { isActive: false }
            );
        } else {
            // If this context is set to inactive, ensure at least one context is active
            const activeContexts = await UniversalContext.find({ isActive: true });
            if (activeContexts.length === 0) {
                logger.info('No active contexts found, setting the first context as active');
                const firstContext = await UniversalContext.findOne().sort('createdAt');
                firstContext.isActive = true;
                await firstContext.save();
            }
        }

        logger.info(`Successfully updated universal context with ID: ${id}`);
        res.status(200).json({ 
            message: "Context settings saved successfully",
            data: { id, isActive, prompt }
        });
    } catch (error) {
        logger.error({ error }, 'Error updating universal context');
        res.status(500).json({ message: "Failed to update context settings" });
    }
};

const getAllSupportRequestsForMVAdmin = async (req, res) => {
    try {
        logger.info('Fetching all support requests for MV Admin');

        // Fetch all support requests
        const supportRequests = await SupportRequest.find();

        // Get unique organizationIds from support requests
        const organizationIds = [...new Set(supportRequests.map(req => req.organizationId))];

        // Fetch users with matching organizationIds
        const users = await User.find(
            { organizationId: { $in: organizationIds } },
            { organizationId: 1, instagramUserName: 1 }
        );

        // Create a map of organizationId to instagramUserName
        const orgToInstagramMap = users.reduce((map, user) => {
            map[user.organizationId] = user.instagramUserName;
            return map;
        }, {});

        // Filter and group support requests by organizationId and add instagramUserName
        const supportRequestsByOrg = supportRequests.reduce((result, supportRequest) => {
            const { organizationId } = supportRequest;
            const instagramUserName = orgToInstagramMap[organizationId];

            // Only include support requests for organizations that exist in the User db
            if (organizationId && instagramUserName) {
                if (!result[organizationId]) {
                    result[organizationId] = {
                        supportRequests: [],
                        instagramUserName,
                    };
                }
                result[organizationId].supportRequests.push(supportRequest);
            }
            return result;
        }, {});

        const response = Object.entries(supportRequestsByOrg).map(([organizationId, data]) => ({
            organizationId,
            instagramUserName: data.instagramUserName,
            supportRequests: data.supportRequests,
        }));

        logger.info(`Successfully fetched support requests for ${response.length} organizations`);
        res.status(200).json(response);
    } catch (error) {
        logger.error({ err: error }, 'Error fetching support requests for MV Admin');
        res.status(500).json({ message: "Internal server error" });
    }
};

const transformContext = (context) => {
    const { _id, isActive, prompt } = context.toObject();
    return {
        contextId: _id.toString(),
        isActive,
        prompt
    };
};

const getMessageCountByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate) {
            logger.info('Request made without startDate');
            return res.status(400).json({ message: "Bad request: startDate is required" });
        }

        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0); // Set to start of day

        let endDateTime;
        if (endDate) {
            endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999); // Set to end of day
            logger.info(`Fetching message and user count for all organizations, from ${startDate} to ${endDate}`);
        } else {
            endDateTime = new Date(startDateTime);
            endDateTime.setHours(23, 59, 59, 999); // Set to end of start date
            logger.info(`Fetching message and user count for all organizations, for date ${startDate}`);
        }

        const result = await Conversation.aggregate([
            {
                $match: {
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
                    _id: {
                        organizationId: "$organizationId",
                        userId: "$userId"
                    },
                    messageCount: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: "$_id.organizationId",
                    messageCount: { $sum: "$messageCount" },
                    userCount: { $sum: 1 },
                    users: { $push: "$_id.userId" }
                }
            },
            {
                $project: {
                    organizationId: "$_id",
                    messageCount: 1,
                    userCount: 1,
                    users: 1
                }
            },
            {
                $group: {
                    _id: null,
                    totalMessageCount: { $sum: "$messageCount" },
                    allUsers: { $push: "$users" },
                    organizations: { 
                        $push: { 
                            organizationId: "$organizationId", 
                            messageCount: "$messageCount",
                            userCount: "$userCount"
                        } 
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalMessageCount: 1,
                    totalUserCount: {
                        $size: {
                            $reduce: {
                                input: "$allUsers",
                                initialValue: [],
                                in: { $setUnion: ["$$value", "$$this"] }
                            }
                        }
                    },
                    organizations: 1
                }
            }
        ]);

        const finalResult = result.length > 0 ? result[0] : { 
            totalMessageCount: 0, 
            totalUserCount: 0, 
            organizations: [] 
        };

        logger.info(`Successfully fetched message and user counts for all organizations`);
        res.status(200).json(finalResult);
    } catch (error) {
        logger.error({ err: error }, `Error fetching message and user counts`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getSupportRequestCount = async (req, res) => {
    try {
        const { status } = req.query;
        logger.info(`Fetching count of support requests with status: ${status || 'all'}`);

        let query = {};
        if (status && status !== 'all') {
            if (!['Open', 'InProgress', 'Resolved'].includes(status)) {
                return res.status(400).json({ message: "Invalid status parameter" });
            }
            query.status = status;
        }

        const requestCount = await SupportRequest.countDocuments(query);

        logger.info(`Successfully fetched support request count: ${requestCount}`);
        res.status(200).json({ requestCount });
    } catch (error) {
        logger.error({ err: error }, 'Error fetching support request count');
        res.status(500).json({ message: "Internal server error" });
    }
};

const getUserCountByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate) {
            logger.info('Request made without startDate');
            return res.status(400).json({ message: "Bad request: startDate is required" });
        }

        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0); // Set to start of day

        let endDateTime;
        if (endDate) {
            endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999); // Set to end of day
            logger.info(`Fetching user count from ${startDate} to ${endDate}`);
        } else {
            endDateTime = new Date(startDateTime);
            endDateTime.setHours(23, 59, 59, 999); // Set to end of start date
            logger.info(`Fetching user count for date ${startDate}`);
        }

        const count = await User.countDocuments({
            createdAt: { $gte: startDateTime, $lte: endDateTime }
        });

        logger.info(`Successfully fetched user count: ${count}`);
        res.status(200).json({ count });
    } catch (error) {
        logger.error({ err: error }, `Error fetching user count`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getActiveUserCount = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate) {
            logger.info('Request made without startDate');
            return res.status(400).json({ message: "Bad request: startDate is required" });
        }

        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0); // Set to start of day

        let endDateTime;
        if (endDate) {
            endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999); // Set to end of day
            logger.info(`Fetching active user count from ${startDate} to ${endDate}`);
        } else {
            // If no endDate, set to end of startDate
            endDateTime = new Date(startDateTime);
            endDateTime.setHours(23, 59, 59, 999);
            logger.info(`Fetching active user count for date ${startDate}`);
        }

        const count = await User.countDocuments({
            lastLogin: { $gte: startDateTime, $lte: endDateTime }
        });

        logger.info(`Successfully fetched active user count: ${count}`);
        res.status(200).json({ activeUserCount: count });
    } catch (error) {
        logger.error({ err: error }, `Error fetching active user count`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getInactiveUserCount = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate) {
            logger.info('Request made without startDate');
            return res.status(400).json({ message: "Bad request: startDate is required" });
        }

        const startDateTime = new Date(startDate);
        startDateTime.setHours(0, 0, 0, 0); // Set to start of day

        let endDateTime;
        if (endDate) {
            endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999); // Set to end of day
            logger.info(`Fetching inactive user count from ${startDate} to ${endDate}`);
        } else {
            // If no endDate, set to end of startDate
            endDateTime = new Date(startDateTime);
            endDateTime.setHours(23, 59, 59, 999);
            logger.info(`Fetching inactive user count for date ${startDate}`);
        }

        const inactiveCount = await User.countDocuments({
            $or: [
                { lastLogin: { $lt: startDateTime } },
                { lastLogin: { $gt: endDateTime } },
                { lastLogin: null }
            ]
        });

        logger.info(`Successfully fetched inactive user count: ${inactiveCount}`);
        res.status(200).json({ inactiveUserCount: inactiveCount });
    } catch (error) {
        logger.error({ err: error }, `Error fetching inactive user count`);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getAllUniversalContexts,
    updateUniversalContext,
    getAllUsers,
    getAllSupportRequestsForMVAdmin,
    getMessageCountByDateRange,
    getSupportRequestCount,
    getUserCountByDateRange,
    getActiveUserCount,
    getInactiveUserCount,
}
