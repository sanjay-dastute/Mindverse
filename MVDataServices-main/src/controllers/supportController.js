const supportConnection = require('../config/support');
const SupportRequest = supportConnection.model('SupportRequest');
const logger = require('../config/logger');

const getAllRequests = async (req, res) => {
    try {
        const { organizationId } = req.params;

        logger.info(`Fetching all support requests for organizationId: ${organizationId}`);

        if (!organizationId) {
            logger.error('Request made without organizationId');
            return res.status(400).json({ message: "Bad Request: OrganizationId is required" });
        }

        const supportRequests = await SupportRequest.find({ organizationId });

        logger.info(`Successfully fetched ${supportRequests.length} support requests for organizationId: ${organizationId}`);
        res.status(200).json(supportRequests);
    } catch (error) {
        logger.error({ err: error }, `Error fetching support requests for organizationId: ${req.params.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createSupportRequest = async (req, res) => {
    try {
        const { organizationId } = req.params;
        const { type, query } = req.body;

        logger.info(`Creating support request for organizationId: ${organizationId}`);

        if (!organizationId) {
            logger.error('Request made without organizationId');
            return res.status(400).json({ message: "Bad Request: OrganizationId is required" });
        }

        if (!type || !query) {
            logger.error('Request made without type or query');
            return res.status(400).json({ message: "Bad Request: Type and query are required" });
        }

        const newSupportRequest = new SupportRequest({
            organizationId,
            type,
            query,
        });

        await newSupportRequest.save();

        logger.info(`Support request created successfully for organizationId: ${organizationId}`);
        res.status(201).json({
            message: "Support request created successfully",
            requestId: newSupportRequest.requestId,
            organizationId: newSupportRequest.organizationId,
            type: newSupportRequest.type,
            query: newSupportRequest.query
        });
    } catch (error) {
        logger.error({ err: error }, `Error creating support request for organizationId: ${req.params.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getMessagesForRequest = async (req, res) => {
    try {
        const { organizationId, requestId } = req.params;

        logger.info(`Fetching messages for support request: ${requestId}, organizationId: ${organizationId}`);

        const supportRequest = await SupportRequest.findOne({ organizationId, requestId });

        if (!supportRequest) {
            logger.error(`Support request not found for requestId: ${requestId}, organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Support request not found" });
        }

        logger.info(`Successfully fetched messages for support request: ${requestId}`);
        res.status(200).json({ messages: supportRequest.messages });
    } catch (error) {
        logger.error({ err: error }, `Error fetching messages for support request: ${req.params.requestId}, organizationId: ${req.params.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const addMessageToRequest = async (req, res) => {
    try {
        const { organizationId, requestId } = req.params;
        const { text, sender } = req.body;

        logger.info(`Adding message to support request: ${requestId}, organizationId: ${organizationId}`);

        const supportRequest = await SupportRequest.findOneAndUpdate(
            { organizationId, requestId: requestId },
            { $push: { messages: { text, sender } } },
            { new: true }
        );

        if (!supportRequest) {
            logger.error(`Support request not found for requestId: ${requestId}, organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Support request not found" });
        }

        logger.info(`Message added successfully to support request: ${requestId}`);
        res.status(201).json({ 
            message: "Message added successfully",
            addedMessage: { text, sender }
        });
    } catch (error) {
        logger.error({ err: error }, `Error adding message to support request: ${req.params.requestId}, organizationId: ${req.params.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const resolveSupportRequest = async (req, res) => {
    try {
        const { organizationId, requestId } = req.params;

        logger.info(`Resolving support request: ${requestId}, organizationId: ${organizationId}`);

        const supportRequest = await SupportRequest.findOneAndUpdate(
            { organizationId, requestId: requestId },
            { $set: { status: "Resolved" } },
            { new: true }
        );

        if (!supportRequest) {
            logger.error(`Support request not found for requestId: ${requestId}, organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Support request not found" });
        }

        logger.info(`Support request resolved successfully: ${requestId}`);
        res.status(200).json({ 
            message: "Support request resolved successfully",
            requestId: supportRequest._id,
            status: supportRequest.status
        });
    } catch (error) {
        logger.error({ err: error }, `Error resolving support request: ${req.params.requestId}, organizationId: ${req.params.organizationId}`);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getAllRequests,
    createSupportRequest,
    getMessagesForRequest,
    addMessageToRequest,
    resolveSupportRequest,
}