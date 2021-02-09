const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

require('dotenv').config()

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        default: []
    }],
    plans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        default: []
    }],
    badges: {
        type: Array,
        default: []
    },
    stats: {
        points: { type: Number, default: 0, required: true },
        earnedBadges: { type: Number, default: 0, required: true },
        plans: {
            completed: { type: Number, default: 0, required: true },
            completedTasks: { type: Number, default: 0, required: true },
            created: { type: Number, default: 0, required: true }
        },
        skills: {
            completedLevels: { type: Number, default: 0, required: true },
            earnedXp: { type: Number, default: 0, required: true },
            created: { type: Number, default: 0, required: true }
        }
    },
    refresh: {
        type: String,
        required: true
    }
})

userSchema.pre('save', function (next) {
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err)

        this.password = bcrypt.hashSync(this.password, salt)
        next()
    })
})

userSchema.methods.validatePassword = async function (password) {
    return bcrypt.compare(password, this.password)
}

// add default key-value pairs on creating like badges: 0 and so on to write less code
const User = mongoose.model('User', userSchema)

module.exports = User