const mongoose = require('mongoose')

const planSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    progress: {
        type: Number,
        required: true,
        default: 0
    },
    completed: {
        type: Boolean,
        required: true,
        default: false
    },
    tasks: {
        type: Array,
        required: true,
        default: []
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
})

const Plan = mongoose.model('Plan', planSchema)

module.exports = Plan