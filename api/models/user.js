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
    skills: {
        type: Array,
        default: []
    },
    plans: {
        type: Array,
        default: []
    },
    badges: {
        type: Array,
        default: []
    },
    points: {
        type: Number,
        default: 0,
        required: true
    },
    refresh: {
        type: String,
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