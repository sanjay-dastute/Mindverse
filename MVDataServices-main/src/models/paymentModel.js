const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
    order_id: {
        type: String,
        required: true
    },
    payment_id: {
        type: String,
        required: false
    },
    signature: {
        type: String,
        required: false
    },
    organizationId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        default: ''
    },
    amount: {
        type: String,
        default: ''
    },
    currency: {
        type: String,
        default: ''
    },
    mobile_no: {
        type: String,
        default: ''
    },
    payment_status: {
        type: String,
        default: ''
    },
    createdTime: {
        type: Date,
        default: Date.now
    },
    updatedTime: {
        type: Date,
        default: ''
    },
});

module.exports = PaymentSchema;