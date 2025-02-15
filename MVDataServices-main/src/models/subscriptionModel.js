const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
    organizationId: {
        type: String,
        required: true
    },
    subscription_id: {
        type: String,
        required: true
    },
    plan_id: {
        type: String,
        required: true
    },
    payment_id: {
        type: String,
        default: ''
    },
    signature: {
        type: String,
        default: ''
    },
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    current_start: {
        type: String,
        required: false
    },
    current_end: {
        type: String,
        required: false
    },
    ended_at: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        required: true
    },
    charge_at: {
        type: String,
        default: ''
    },
    start_at: {
        type: String,
        default: ''
    },
    end_at: {
        type: String,
        default: ''
    },
    payment_status: {
        type: String,
        default: ''
    },
    total_count: {
        type: Number,
        required: true
    },
    paid_count: {
        type: Number,
        required: true
    },
    remain_count: {
        type: Number,
        required: true
    },
    customer_notify: {
        type: Boolean,
        required: true
    },
    createdTime: {
        type: Date,
        default: Date.now
    },
    expiredTime: {
        type: Date,
        default: ''
    },
    updatedTime: {
        type: Date,
        default: ''
    }
});

module.exports = SubscriptionSchema;