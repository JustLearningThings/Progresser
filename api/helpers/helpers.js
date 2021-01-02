const Skill = require('./Skill')
const Plan = require('./Plan')
const Badge = require('./Badge')

const User = require('../models/user.js')
const jwt = require('jsonwebtoken')

require('dotenv').config()

// using classes with static methods as a means to organize code
class UserController {
    static async read(req, res, next) {
        const { accessToken } = req.cookies

        if (!accessToken) return res.status(400).json({ message: 'Bad Request: missing access token' })

        const userId = await jwt.decode(accessToken).sub

        User.findById(userId)
        .populate([
            { path: 'skills' },
            { path: 'plans' }
        ])
        .exec((err, foundUser) => {
            if (err || !foundUser) return res.status(409).json({ message: 'Conflict: cannot find user' })

            const user = foundUser.toObject()

            delete user.refresh
            delete user.password
            delete user._id
            delete user.__v

            res.json(user)
        })
    }
}

// remove badge model 
module.exports = {
    Skill,
    Plan,
    Badge,
    UserController
}