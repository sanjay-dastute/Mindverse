const paymentConnection = require("../config/payment");
const Payment = paymentConnection.model('Payment');
const Subscription = paymentConnection.model('Subscription');
const logger = require('../config/logger');

const createPayment = async (req, res) => {
    try {
        const paymentData = req.body;

        logger.info(`Creating new payment for organizationId: ${paymentData.organizationId}`);
        const modifiedData = {
            order_id: paymentData.id,
            payment_id: '',
            signature: '',
            organizationId: paymentData.organizationId,
            username: paymentData.name,
            mobile_no: paymentData.mobile,
            amount: paymentData.amount,
            currency: paymentData.currency,
            payment_status: paymentData.status
        }

        const newPayment = new Payment(modifiedData);
        await newPayment.save();

        logger.info(`Successfully created new Payment Info`);
        res.status(201).json(newPayment);
    } catch (error) {
        logger.error({ err: error }, `Error creating Payment Info`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { orderId, paymentId, signature, organizationId } = req.body;
        logger.info(`Verifying a payment for organizationId: ${organizationId}`);

        const verification = await Payment.findOne({
            order_id: orderId,
            organizationId
        });

        if (!verification) {
            logger.info(`Payment Order not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Payment Order not found" });
        }

        verification.payment_id = paymentId;
        verification.signature = signature;
        verification.payment_status = 'verified';
        verification.updatedTime = new Date();

        await verification.save();

        logger.info(`Successfully Verified Payment Info and updated`);
        res.status(200).json(verification);
    } catch (error) {
        logger.error({ err: error }, `Error verifying Payment Info`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getAllPaymentsByOrganizationId = async (req, res) => {
    try {
        const { organizationId } = req.query;

        logger.info(`Getting payments for organizationId: ${organizationId}`);

        const newPayment = await Payment.find({ organizationId });

        res.status(201).json(newPayment);
    } catch (error) {
        logger.error({ err: error }, `Error Getting Payment Info`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getPaymentByOrderId = async (req, res) => {
    try {
        const { organizationId, orderId } = req.query;

        logger.info(`Getting payment for organizationId: ${organizationId} with OrderId: ${orderId}`);

        const newPayment = await Payment.find({ organizationId, order_id: orderId });

        res.status(201).json(newPayment);
    } catch (error) {
        logger.error({ err: error }, `Error Getting Payment Info with orderId`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const createSubscription = async (req, res) => {
    try {
        const paymentData = req.body;

        logger.info(`Creating new payment subscription for organizationId: ${paymentData.organizationId}`);
        const modifiedData = {
            organizationId: paymentData.organizationId,
            subscription_id: paymentData.id,
            plan_id: paymentData.plan_id,
            name: paymentData.notes.name,
            mobile: paymentData.notes.mobile,
            current_start: paymentData.current_start,
            current_end: paymentData.current_end,
            ended_at: paymentData.ended_at,
            quantity: paymentData.quantity,
            charge_at: paymentData.charge_at,
            start_at: paymentData.start_at,
            end_at: paymentData.end_at,
            payment_status: paymentData.status,
            total_count: paymentData.total_count,
            paid_count: paymentData.paid_count,
            remain_count: paymentData.remaining_count,
            customer_notify: paymentData.customer_notify,
            createdTime: paymentData.created_at,
            expiredTime: paymentData.expire_by,
        }

        const newPayment = new Subscription(modifiedData);
        await newPayment.save();

        logger.info(`Successfully created new Payment Subscription Info`);
        res.status(201).json(newPayment);
    } catch (error) {
        logger.error({ err: error }, `Error creating Payment Subscription Info`);
        res.status(500).json({ message: "Internal server error" });
    }
};

const verifySubscription = async (req, res) => {
    try {
        const { subscriptionId, paymentId, signature, organizationId } = req.body;
        logger.info(`Verifying a subscription payment for organizationId: ${organizationId}`);

        const verification = await Subscription.findOne({
            subscription_id: subscriptionId,
            organizationId
        });

        if (!verification) {
            logger.info(`Subscription Payment Order not found for organizationId: ${organizationId}`);
            return res.status(404).json({ message: "Subscription Payment Order not found" });
        }

        verification.payment_id = paymentId;
        verification.signature = signature;
        verification.payment_status = 'verified';
        verification.updatedTime = new Date();

        await verification.save();

        logger.info(`Successfully Verified Subscription Payment Info and updated`);
        res.status(200).json(verification);
    } catch (error) {
        logger.error({ err: error }, `Error verifying Payment Info`);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createPayment,
    verifyPayment,
    getAllPaymentsByOrganizationId,
    getPaymentByOrderId,
    createSubscription,
    verifySubscription
};