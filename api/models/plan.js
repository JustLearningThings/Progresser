const mongoose = require('mongoose')

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    // level: {
    //     type: Number,
    //     required: true,
    //     default: 0
    // },
    xp: {
        type: Number,
        required: true,
        default: 0
    },
    requiredXp: {
        type: Number,
        required: true
    },
    tasks: {
        type: Array,
        required: true,
        default: []
    }
})

const Plan = mongoose.model('Plan', planSchema)

module.exports = Plan