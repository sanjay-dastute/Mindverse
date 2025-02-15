const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    type: {
        type: String,
        enum: ['DM', 'CM'],
        required: true
    },
    originalQuery: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    mediaId: {
        type: String,
        default: ''
    },
    audioUrl: {
        type: String,
        default: ''
    },
    ai: {
        type: String,
        default: ''
    },
    feeling: {
        type: String,
        default: ''
    },
    userFeeling: {
        type: String,
        default: ''
    },
    createdTimestamp: {
        type: Date,
        default: Date.now
    },
    repliedTimestamp: {
        type: Date
    },
    messageId: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

const ConversationSchema = new Schema({
    organizationId: {
        type: String,
        required: true
    },
    fromId: {
        type: String,
        required: true
    },
    source: {
        type: String,
        default: 'instagram'
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    userId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: false
    },
    messages: [MessageSchema],
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = ConversationSchema;