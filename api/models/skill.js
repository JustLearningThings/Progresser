const mongoose = require('mongoose')

const skillSchema = new mongoose.Schema({
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
    level: {
        type: Number,
        required: true,
        default: 0
    },
    levels: {
        type: Number,
        // required: true
    },
    xp: {
        type: Number,
        required: true,
        default: 0
    },
    requiredXp: {
        type: Number,
        required: true,
        default: 10
    },
    actions: {
        type: Array,
        default: []
    }
})

const Skill = mongoose.model('Skill', skillSchema)

module.exports = Skill