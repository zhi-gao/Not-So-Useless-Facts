/*
A model for reports
Must be created by user
Needs the Id of the user reporting
Needs the Id of the user/fact being reported on
Uses pre-save hooks that will dynamically create the "flag" part of the reportModel
If it is a user being reported on, then the flags will be: "inappropriateBehavior", "spam", and "other"
If it is a fact being reported on, then the flags will be: "misleading", "inaccurate" and "other"
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportModel = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientId', // Dynamic reference based on 'recipientId' field
    },
    recipientType: {
        type: String,
        required: true,
        enum: ['User', 'Fact'], // Specify the possible recipient
    },
    flag: {},
    comment: {
        type: String,
    },
}, { timestamps: true });

// Define pre-save hook to set flags based on the recipient type
reportModel.pre('save', function (next) {
    if (this.recipientId === 'User') {
        this.flags = {
            inappropriateBehavior: {
                type: Boolean,
                default: false,
            },
            spam: {
                type: Boolean,
                default: false,
            },
            other: {
                type: Boolean,
                default: false,
            },
        };
    } else if (this.recipientId === 'Fact') {
        this.flags = {
            misleading: {
                type: Boolean,
                default: false,
            },
            inaccurate: {
                type: Boolean,
                default: false,
            },
            other: {
                type: Boolean,
                default: false,
            },
        };
    }
    next();
});

const Report = mongoose.model('Report', reportModel);

module.exports = Report;
