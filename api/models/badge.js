const mongoose = require('mongoose')

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    icon: {
        type: String,
        required: true
    },
    tier: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
})

const Badge = mongoose.model('Badge', badgeSchema)

module.exports = Badge